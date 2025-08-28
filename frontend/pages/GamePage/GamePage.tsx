import React, { useRef, useState, Suspense, useMemo, useEffect } from 'react';
import { usePlayersContext } from '../../context/PlayersContext'
import { useUserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { postMatchHistoryBulk, postTournamentHistory, TournamentPayload, StatsPayload } from './postresulttest';
import KeyBindingsPanel, { KeyBindings, loadBindings, labelForCode } from './KeyBindings';
import { useTournamentBracket, type Player } from './Tournament';
import { useTranslation } from 'react-i18next';

const GameCanvas = React.lazy(() => import('../../game/main'));

type WinMode = 'bo5' | 'bo9' | 'bo19';
const winTarget = (m: WinMode) => (m === 'bo5' ? 3 : m === 'bo9' ? 5 : 10);

type SpeedPreset = 'slow' | 'medium' | 'fast';
const SPEED_MAP: Record<SpeedPreset, number> = {
  slow: 0.12,
  medium: 0.16,
  fast: 0.22,
};

type MapKey = 'default' | 'large' | 'obstacles';

function normalizePlayers(
  ps: ({ id?: string; username: string; elo?: number } | Player)[] = []
): Player[] {
  return ps
    .filter(p => !!p?.username)
    .map((p: any) => ({
      id: toIdOrGuest(p.id),
      username: p.username,
      elo: p.elo ?? 1000,
    }));
}

const GUEST_RE = /^guest(?:-|$)/i;

function isGuestId(id: unknown): boolean {
  return GUEST_RE.test(String(id ?? ''));
}

// Helper to handle guest id for posting
function toIdOrGuest(id: unknown): string {
  const s = String(id ?? '').trim();
  if (!s) return 'guest';
  const lower = s.toLowerCase();
  if (isGuestId(s) || lower === 'null' || lower === 'undefined') return 'guest';
  return s;
}

function buildPayload(
  me: { id?: string | null; username?: string },
  opp: { id?: string | null; username?: string },
  myScore: number,
  theirScore: number,
  durationSec: number,
  played_at_iso: string
): StatsPayload {
  const meName  = me?.username  ?? 'Player';
  const oppName = opp?.username ?? 'Opponent';

  const playerId   = toIdOrGuest(me?.id);
  const opponentId = toIdOrGuest(opp?.id);

  const guestOpp =
    opponentId.toLowerCase() === 'guest' ||
    GUEST_RE.test(String(opp?.username ?? ''));

  return {
    player_id: playerId,
    player_username: meName,
    player_name: meName,
    opponent_id: opponentId,
    opponent_username: oppName,
    opponent_name: oppName,
    player_score: myScore,
    opponent_score: theirScore,
    duration: Math.max(0, Math.round(durationSec)),
    result: myScore > theirScore ? 'win' : myScore < theirScore ? 'loss' : 'draw',
    is_guest_opponent: guestOpp ? 1 : 0,
    played_at: played_at_iso,
  };
}

// Flow of the page Options -> Game -> Post-match screen -> ...
export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [bindings, setBindings] = useState<KeyBindings>(() => loadBindings());
  const { players: rawPlayers, totalPlayers, isTournament, tournamentTitle, resetPlayers, setIsTournament } = usePlayersContext();
  const [mapKey, setMapKey] = useState<MapKey>('default');

  // Options
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('medium');
  const baseSpeed = useMemo(() => SPEED_MAP[speedPreset], [speedPreset]);
  const [winMode, setWinMode] = useState<WinMode>('bo5');
  const target = useMemo(() => winTarget(winMode), [winMode]);

  // Temporary options, only applied if confirmed in the options
  const [draftBindings, setDraftBindings] = useState<KeyBindings>(bindings);
  const [draftSpeedPreset, setDraftSpeedPreset] = useState<SpeedPreset>(speedPreset);
  const [draftWinMode, setDraftWinMode] = useState<WinMode>(winMode);
  const [draftMapKey, setDraftMapKey] = useState<MapKey>(mapKey);

  const { user } = useUserContext();
  const [startAt, setStartAt] = useState<Date | null>(null);
  const matchSnapshot = useRef<{ p1: Player; p2: Player; startedAt: Date } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const pendingTournamentEntries = useRef<TournamentPayload[]>([]);
  const pendingMatchHistory = useRef<StatsPayload[]>([]);

  const { t } = useTranslation();

  type Phase =
    | 'home' 
    | 'options'
    | 't_options'
    | 'prematch'
    | 'playing'
    | 'post'
    | 'champion';

  const initialPhase: Phase = isTournament ? 'prematch' : 'home';
  const [phase, setPhase] = useState<Phase>(initialPhase);

  // Listen for a case where the page is being left and reset variables if so
  useEffect(() => {
    const onLeave = () => {
      try {
        resetPlayers();
        setIsTournament(false);
       } catch {}
      sessionStorage.setItem('lastPathBeforeUnload', window.location.pathname);
    };
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [resetPlayers, setIsTournament]);

  // If page refresh, redirect to user page or sign in
  useEffect(() => {
    const ran = (window as any).__gp_reloadGate ?? false;
    if (ran) return;
    (window as any).__gp_reloadGate = true;

    const nav = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
    const reloaded =
      (nav && nav[0]?.type === 'reload') ||
      ((performance as any).navigation && (performance as any).navigation.type === 1);

    const lastPath = sessionStorage.getItem('lastPathBeforeUnload');
    const sameRoute = lastPath === window.location.pathname;

    if (reloaded && sameRoute) {
      sessionStorage.removeItem('lastPathBeforeUnload');
      try {
        resetPlayers();
        setIsTournament(false);
      } catch {}
      const dest = user?.username
        ? `/user/${encodeURIComponent(user.username)}`
        : '/signin';
      navigate(dest, { replace: true });
    }
  }, [navigate, resetPlayers, setIsTournament, user?.username]);

  // Reset champion if new tournament
  useEffect(() => {
    if (isTournament) setChampion(null);
  }, [isTournament]);

  // Initialise options phase
  useEffect(() => {
    if (phase === 'options') {
      setDraftBindings(bindings);
      setDraftSpeedPreset(speedPreset);
      setDraftWinMode(winMode);
      setDraftMapKey(mapKey);
    }
  }, [phase, bindings, speedPreset, winMode, mapKey]);

  // Regular match options
  const openOptions = () => setPhase('options');

  const cancelOptions = () => {
    // Discard changes
    setPhase('home');
  };

  const confirmOptions = () => {
    // Persist changes
    setBindings(draftBindings);
    setSpeedPreset(draftSpeedPreset);
    setWinMode(draftWinMode);
    setMapKey(draftMapKey);
    setPhase('home');
  };

  // Initialise tournament pre-match options phase
  useEffect(() => {
    if (phase === 't_options') {
      setDraftBindings(bindings);
    }
  }, [phase, bindings]);

  // Tournament pre-match options
  const openTournamentOptions = () => setPhase('t_options');

  const cancelTournamentOptions = () => {
    // Discard changes
    setDraftBindings(bindings);
    setPhase('prematch');
  };

  const confirmTournamentOptions = () => {
    // Persist changes
    setBindings(draftBindings);
    setPhase('prematch');
  };

  // Non‑tournament post screen
  const [postResult, setPostResult] = useState<{ winner: string; s1: number; s2: number } | null>(null);

  // Tournament state
  const entrants = useMemo<Player[]>(() => {
    if (!isTournament) {
      const base = rawPlayers?.length
        ? rawPlayers.slice(0, 2)
        : ([{ username: 'Player 1' }, { username: 'Player 2' }] as any);
      return normalizePlayers(base);
    }
    // Tournament: take exactly the selected amount from context
    const size = totalPlayers ?? rawPlayers?.length ?? 0;
    const list = (rawPlayers ?? []).slice(0, size);
    // If setup is incomplete, return empty and let the init effect handle it
    if (list.length < 2) return [];

    return normalizePlayers(list as any);
  }, [isTournament, rawPlayers, totalPlayers]);

  // Set up tournament variables from the imported file
  const {
    pairsCount,
    currentPair,
    upcomingPair,
    roundNum,
    matchIdx,
    advanceByName,
    stageForPosting: stageForPost,
  } = useTournamentBracket(entrants, isTournament);

  const p1Name = isTournament ? currentPair?.[0]?.username ?? '—' : (rawPlayers?.[0]?.username ?? 'Player 1');
  const p2Name = isTournament ? currentPair?.[1]?.username ?? '—' : (rawPlayers?.[1]?.username ?? 'Player 2');
  const [champion, setChampion] = useState<Player | null>(null);

  const handleStart = () => {
    const now = new Date();
    setStartAt(now);
    setSubmitted(false);
    if (isTournament && currentPair) {
      matchSnapshot.current = { p1: currentPair[0], p2: currentPair[1], startedAt: now };
    } else {
      const p1 = (rawPlayers?.[0] as any) ?? { id: 'guest', username: 'Player 1', elo: 1000 };
      const p2 = (rawPlayers?.[1] as any) ?? { id: 'guest', username: 'Player 2', elo: 1000 };
      matchSnapshot.current = { p1, p2, startedAt: now };
    }
    setPhase('playing');
  };

  // Called by the main when a match finishes
  const handleMatchEnd = async (winnerName: string, s1: number, s2: number) => {
    const snap = matchSnapshot.current;
    const p1 = snap?.p1 ?? currentPair?.[0];
    const p2 = snap?.p2 ?? currentPair?.[1];

    // Failsafe
    if (!p1 || !p2) return;

    const started = snap?.startedAt ?? startAt ?? new Date();
    const ended = new Date();
    const durationMs = ended.getTime() - started.getTime();
    const durationSec = Math.max(0, Math.round(durationMs / 1000));
    const played_at_iso = started.toISOString();

    function afterSubmitUI() {
      if (!isTournament) {
        setPostResult({ winner: winnerName, s1, s2 });
        setPhase('post');
        return;
      }
      const { completed, champion: champ } = advanceByName(winnerName);
      if (completed) {
        setChampion(champ ?? null);
        setPhase('champion');
      } else {
        setPhase('prematch');
      }
    }

    async function submitAll() {
      if (submitted) { afterSubmitUI(); return; }
      setSubmitted(true);

      try {
        const payloadPlayer1 = buildPayload(p1, p2, s1, s2, durationSec, played_at_iso);
        pendingMatchHistory.current.push(payloadPlayer1);

        const token = user?.accessToken;
        // Regular match
        if (!isTournament) {
          if (token) {
            await postMatchHistoryBulk(pendingMatchHistory.current, token);
          } else {
            console.warn('No access token — match_history bulk skipped.');
          }
          pendingMatchHistory.current = [];
        }
        // Tournament: Accumulate entries to push at the end
        else {
          const tournament_id = (tournamentTitle ?? '').trim();
          if (tournament_id) {
            const stage_number = stageForPost();
            const resultP1: 'win' | 'loss' | 'draw' = s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw';
            const entry: TournamentPayload = {
              tournament_id,
              stage_number,
              match_number: matchIdx + 1,
              player_name: p1.username,
              opponent_name: p2.username,
              result: resultP1,
            };
            pendingTournamentEntries.current.push(entry);
          }
          if (token) {
            await Promise.all([
              pendingTournamentEntries.current.length
                ? postTournamentHistory(pendingTournamentEntries.current, token)
                : Promise.resolve(null),
              pendingMatchHistory.current.length
                ? postMatchHistoryBulk(pendingMatchHistory.current, token)
                : Promise.resolve(null),
            ]);
          } else {
            console.warn('No access token — tournament+match_history bulks skipped.');
          }
          pendingTournamentEntries.current = [];
          pendingMatchHistory.current = [];
        }
        afterSubmitUI();
      } catch (err) {
        console.error(err);
        if (!isTournament) {
          setSubmitted(false);
          setPostResult({ winner: winnerName, s1, s2 });
          setPhase('post');
        }
      } finally {
        matchSnapshot.current = null;
      }
    }
    await submitAll();
  };

  const handlePlayAgain = () => {
    // Return to options and remove the game from the background for a clean start option
    setPhase('home');
    setPostResult(null);
  };

  // Page elements
  return (
    <div className="flex flex-col items-center -mt-6 md:-mt-10 lg:-mt-3 space-y-2">
      <div className="w-9/10 mx-auto">

      {/* Home screen */}
        {!isTournament && phase === 'home' && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold mb-2">{t('game.title')}</h2>
                <button
                  onClick={handleStart}
                  className="block mx-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  {t('game.startMatch')}
                </button>
                <button
                  onClick={openOptions}
                  className="block mx-auto px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700"
                >
                  {t('game.optionsButton')}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Match Options */}
      {!isTournament && phase === 'options' && (
        <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
            <div className="w-full max-w-md p-6">
      
              {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={cancelOptions}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"
                  >
                    {t('game.cancel')}
                  </button>
                  <h2 className="text-xl font-semibold">{t('game.options.title')}</h2>
                  <button
                    onClick={confirmOptions}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
                  >
                    {t('game.confirm')}
                  </button>
                </div>
      
                {/* Speed settings */}
                <fieldset className="mb-6">
                  <legend className="block text-sm text-neutral-300 mb-2">{t('game.options.ballSpeed.subtitle')}</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slow','medium','fast'] as SpeedPreset[]).map(opt => (
                      <label key={opt} className="flex items-center gap-2 rounded-lg bg-neutral-800 p-2 cursor-pointer">
                        <input
                          type="radio"
                          name="speed"
                          value={opt}
                          checked={draftSpeedPreset === opt}
                          onChange={() => setDraftSpeedPreset(opt)}
                        />
                        <span>{t(`game.options.ballSpeed.speed.${opt}`)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                  
                {/* Win mode */}
                <label className="block mb-6">
                  <span className="block text-sm text-neutral-300 mb-1">{t('game.options.winCondition.subtitle')}</span>
                  <select
                    className="w-full rounded-lg bg-neutral-800 p-2"
                    value={draftWinMode}
                    onChange={(e) => setDraftWinMode(e.target.value as WinMode)}
                  >
                    <option value="bo5">{t('game.options.winCondition.bestOf5')}</option>
                    <option value="bo9">{t('game.options.winCondition.bestOf9')}</option>
                    <option value="bo19">{t('game.options.winCondition.bestOf19')}</option>
                  </select>
                </label>
                  
                {/* Map selection */}
                <label className="block mb-6">
                  <span className="block text-sm text-neutral-300 mb-1">{t('game.options.map.subtitle')}</span>
                  <select
                    className="w-full rounded-lg bg-neutral-800 p-2 text-neutral-100"
                    value={draftMapKey}
                    onChange={(e) => setDraftMapKey(e.target.value as MapKey)}
                  >
                    <option value="default">{t('game.options.map.default')}</option>
                    <option value="large">{t('game.options.map.large')}</option>
                    <option value="obstacles">{t('game.options.map.obstacles')}</option>
                  </select>
                </label>
                  
                {/* Controls */}
                <KeyBindingsPanel
                  playerNames={[p1Name, p2Name]}
                  value={draftBindings}
                  onChange={setDraftBindings}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tournament pre‑match screen */}
        {isTournament && phase === 'prematch' && currentPair && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6 text-center">
                <div className="text-sm opacity-70 mb-2">
                  {t('game.tournament.round')} {roundNum} • {t('game.tournament.match')} {matchIdx + 1} / {pairsCount}
                </div>
                <h2 className="text-2xl font-bold mb-6">{t('game.tournament.nextMatch')}</h2>
                <div className="text-xl font-semibold mb-6">
                  {currentPair[0].username} <span className="opacity-70">{t('game.tournament.vs')}</span> {currentPair[1].username}
                </div>

                {upcomingPair && (
                  <div className="text-xs opacity-70 mb-6">
                    {t('game.tournament.upNext')}: {upcomingPair[0].username} {t('game.tournament.vs')} {upcomingPair[1].username}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  className="block mx-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  {t('game.startMatch')}
                </button>

                <button
                  onClick={openTournamentOptions}
                  className="block mx-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
                >
                  {t('game.optionsButton')}
                </button>                
              </div>
            </div>
          </div>
        )}

        {/* Tournament pre-match options */}
        {isTournament && phase === 't_options' && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6">

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={cancelTournamentOptions}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"
                  >
                    {t('game.cancel')}
                  </button>
                  <h2 className="text-xl font-semibold">{t('game.options.title')}</h2>
                  <button
                    onClick={confirmTournamentOptions}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
                  >
                    {t('game.confirm')}
                  </button>
                </div>

                {/* Controls */}
                <KeyBindingsPanel
                  playerNames={[p1Name, p2Name]}
                  value={draftBindings}
                  onChange={setDraftBindings}
                />
              </div>
            </div>
          </div>
        )}

        {/* Game Container */}
        {(phase === 'playing') && (
          <div className="relative w-full pb-[56.25%] bg-black p-3 rounded-3xl overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center">{t('game.loading')}</div>}>
              <GameCanvas
                canvasRef={canvasRef}
                playerNames={[p1Name, p2Name]}
                isTournament={isTournament}
                baseSpeed={baseSpeed}
                winMode={winMode}
                winTarget={target}
                onMatchEnd={handleMatchEnd}
                mapKey={mapKey}
                keyBindings={bindings}
              />
            </Suspense>

            {/* Babylon.js Canvas */}
            <canvas
              ref={canvasRef}
              id="renderCanvas"
              className="absolute top-0 left-0 w-full h-full"
            />

            {/* UI Overlay Elements */}
            <div
              id="startPrompt"
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-white font-sans text-lg z-10 pointer-events-none"
            >
              {t('game.pauseMenu.start')}
            </div>
            <div
               id="endOverlay"
               className="absolute inset-0 pointer-events-none"
             />
             <div
               id="pauseOverlay"
              style={{ visibility: 'hidden' }}
              className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white font-sans z-20 pointer-events-none"
            >
              <div className="text-4xl font-bold mb-2">{t('game.pauseMenu.title')}</div>
              <div className="text-base opacity-75">{t('game.pauseMenu.pause')}</div>
            </div>
          </div>
        )}

        {/* Non‑tournament post-match */}
        {!isTournament && phase === 'post' && postResult && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">{t('game.match.end')}</h2>
                <div className="text-lg mb-1">{t('game.match.winner')}: <span className="font-semibold">{postResult.winner}</span></div>
                <div className="text-sm opacity-80 mb-6">
                  {t('game.match.finalScore')}: {postResult.s1} – {postResult.s2}
                </div>
                <button
                  onClick={handlePlayAgain}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  {t('game.match.playAgain')}
                </button>

                <button
                  onClick={() => {
                    resetPlayers();
                    if (user?.username) {
                      navigate(`/user/${encodeURIComponent(user.username)}`);
                    } else {
                      navigate('/signin');
                    }
                  }}
                  className="block mx-auto mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  {t('game.exit')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tournament: Champion screen */}
        {isTournament && phase === 'champion' && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6 text-center">
                <h2 className="text-3xl font-bold mb-4">{t('game.tournament.complete')}</h2>
                <div className="text-lg opacity-80 mb-6">
                  {t('game.tournament.champion')}&nbsp;
                  <span className="font-semibold">
                    {champion?.username || '—'}
                  </span>
                </div>

                {/* Exit button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      resetPlayers();
                      setIsTournament(false);
                      navigate('/tournaments');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                    aria-label="Exit to tournaments"
                  >
                    {t('game.exit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls screen under the game window */}
        <div className="mt-4 rounded-2xl bg-black text-white border border-white/10 p-4" role="note" aria-label="Game controls">
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
            <div>
              <div className="font-medium mb-1">{p1Name}</div>
              <ul className="space-y-1">
                <li>
                  {t('game.controls.move')}: &nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p1.up)}
                  </kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p1.down)}
                  </kbd>
                </li>
                <li>
                  {t('game.controls.boost')}: &nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p1.boost)}
                  </kbd>
                </li>
              </ul>
            </div>
              
            <div className="sm:justify-self-end sm:text-right">
              <div className="font-medium mb-1">{p2Name}</div>
              <ul className="space-y-1">
                <li>
                  {t('game.controls.move')}: &nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p2.up)}
                  </kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p2.down)}
                  </kbd>
                </li>
                <li>
                  {t('game.controls.boost')}: &nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p2.boost)}
                  </kbd>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
