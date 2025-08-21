import React, { useRef, useState, Suspense, useMemo, useEffect } from 'react';
import { usePlayersContext } from '../../context/PlayersContext'
import { useUserContext } from '../../context/UserContext';
import { postMatchHistory, postTournamentHistory, formatHMS } from './postresulttest';
import KeyBindingsPanel, { KeyBindings, loadBindings, labelForCode } from './KeyBindings';

const GameCanvas = React.lazy(() => import('../../game/main'));

type WinMode = 'bo5' | 'bo9' | 'bo19';
const winTarget = (m: WinMode) => (m === 'bo5' ? 3 : m === 'bo9' ? 5 : 10);

type SpeedPreset = 'slow' | 'medium' | 'fast';
const SPEED_MAP: Record<SpeedPreset, number> = {
  slow: 0.12,
  medium: 0.16,
  fast: 0.22,
};

type Player = { id: string; username: string; elo: number };
type Pair = [Player, Player];
type MapKey = 'default' | 'large' | 'obstacles';

// Stage helpers
function nextPow2(n: number) {
  if (n < 2) return 2;
  return 1 << Math.ceil(Math.log2(n));
}
function roundsFor(size: number) {
  return Math.max(1, Math.log2(size) | 0);
}
function stageForPosting(currentRoundNum: number, bracketSize: number) {
  const totalRounds = roundsFor(bracketSize);
  return totalRounds - (currentRoundNum - 1);
}

function normalizePlayers(
  ps: ({ id?: string; username: string; elo?: number } | Player)[] = []
): Player[] {
  return ps
    .filter(p => !!p?.username && !!p?.id)
    .map((p: any) => ({
      id: p.id,
      username: p.username,
      elo: p.elo ?? 1000,
    }));
}

// Sort players by their ranking, highest vs lowest in a tournament
function seedHighVsLow(players: Player[]): { pairs: Pair[]; carry: Player[] } {
  const sorted = [...players].sort((a, b) => b.elo - a.elo);
  const pairs: Pair[] = [];
  const carry: Player[] = [];

  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    pairs.push([sorted[left], sorted[right]]);
    left++;
    right--;
  }
  // Handle odd, though there shouldn't be odd numbers in our system
  if (left === right) carry.push(sorted[left]);
  return { pairs, carry };
}

// Pair winners of the initial rounds
function pairSequential(ps: Player[]): { pairs: Pair[]; carry: Player[] } {
  const pairs: Pair[] = [];
  const carry: Player[] = [];
  for (let i = 0; i < ps.length; i += 2) {
    if (i + 1 < ps.length) pairs.push([ps[i], ps[i + 1]]);
    else carry.push(ps[i]);
  }
  return { pairs, carry };
}

// Flow of the page Options -> Game -> Post-match screen -> ...
export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bindings, setBindings] = useState<KeyBindings>(() => loadBindings());
  const { players: rawPlayers, totalPlayers, isTournament, tournamentTitle } = usePlayersContext();
  const [mapKey, setMapKey] = useState<MapKey>('default');

  // Options
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('medium');
  const baseSpeed = useMemo(() => SPEED_MAP[speedPreset], [speedPreset]);
  const [winMode, setWinMode] = useState<WinMode>('bo5');
  const target = useMemo(() => winTarget(winMode), [winMode]);

  const { user } = useUserContext();
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);

  type Phase =
    | 'options'
    | 'prematch'
    | 'playing'
    | 'post'
    | 'champion';

  const initialPhase: Phase = isTournament ? 'prematch' : 'options';
  const [phase, setPhase] = useState<Phase>(initialPhase);

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

    // If setup is incomplete, return empty and let the init effect handle it.
    if (list.length < 2) return [];

    return normalizePlayers(list as any);
  }, [isTournament, rawPlayers, totalPlayers]);

  const bracketSize = useMemo(() => {
    if (!isTournament) return 0;
    const n = totalPlayers ?? entrants.length;
    return nextPow2(Math.max(2, n));
  }, [isTournament, totalPlayers, entrants.length]);

  const [roundNum, setRoundNum] = useState(1);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [winnersThisRound, setWinnersThisRound] = useState<Player[]>([]);
  const [carryToNextRound, setCarryToNextRound] = useState<Player[]>([]);
  const currentPair = pairs[matchIdx];
  const upcomingPair = pairs[matchIdx + 1];

  // Initialize tournament
  useEffect(() => {
    if (!isTournament) return;
    if (entrants.length < 2) return;
    const { pairs: p, carry } = seedHighVsLow(entrants);
    setPairs(p);
    setCarryToNextRound(carry);
    setWinnersThisRound([]);
    setMatchIdx(0);
    setRoundNum(1);
    setPhase('prematch');
  }, [isTournament, entrants]);

  const p1Name = isTournament
    ? currentPair?.[0]?.username ?? '—'
    : (rawPlayers?.[0]?.username ?? 'Player 1');

  const p2Name = isTournament
    ? currentPair?.[1]?.username ?? '—'
    : (rawPlayers?.[1]?.username ?? 'Player 2');

  const handleStart = () => {
    setStartAt(new Date());
    setSubmitted(false);
    setPhase('playing');
  };

  // Called by the main when a match finishes
  const handleMatchEnd = async (winnerName: string, s1: number, s2: number) => {
    const started = startAt ?? new Date();
    const ended = new Date();
    const durationMs = ended.getTime() - started.getTime();
    const durationStr = formatHMS(durationMs);
    const played_at_iso = started.toISOString();

    function afterSubmitUI() {
      if (!isTournament) {
        setPostResult({ winner: winnerName, s1, s2 });
        setPhase('post');
        return;
      }
      // Advance bracket
      const winner =
        currentPair[0].username === winnerName ? currentPair[0] :
        currentPair[1].username === winnerName ? currentPair[1] :
        currentPair[0];

      const newWinners = [...winnersThisRound, winner];
      if (matchIdx + 1 < pairs.length) {
        setWinnersThisRound(newWinners);
        setMatchIdx(matchIdx + 1);
        setPhase('prematch');
        return;
      }
      const allAdvancing = [...carryToNextRound, ...newWinners];
      if (allAdvancing.length === 1) {
        setCarryToNextRound(allAdvancing);
        setWinnersThisRound([]);
        setPairs([]);
        setMatchIdx(0);
        setPhase('champion');
        return;
      }
      const { pairs: nextPairs, carry: nextCarry } = pairSequential(allAdvancing);
      setPairs(nextPairs);
      setCarryToNextRound(nextCarry);
      setWinnersThisRound([]);
      setMatchIdx(0);
      setRoundNum(r => r + 1);
      setPhase('prematch');
    }

    async function submitAll() {
      if (submitted) {
        afterSubmitUI();
        return;
      }

      try {
        if (isTournament && currentPair) {
          const p1 = currentPair[0];
          const p2 = currentPair[1];

          // Match history post P1, P2 after
          const payloadP1 = {
            player_id: String(p1.id),
            player_username: p1.username,
            player_name: p1.username,
            opponent_id: String(p2.id),
            opponent_username: p2.username,
            opponent_name: p2.username,
            player_score: s1,
            opponent_score: s2,
            duration: durationStr,
            result: s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw',
            played_at: played_at_iso,
          } as const;

          const payloadP2 = {
            player_id: String(p2.id),
            player_username: p2.username,
            player_name: p2.username,
            opponent_id: String(p1.id),
            opponent_username: p1.username,
            opponent_name: p1.username,
            player_score: s2,
            opponent_score: s1,
            duration: durationStr,
            result: s2 > s1 ? 'win' : s2 < s1 ? 'loss' : 'draw',
            played_at: played_at_iso,
          } as const;

          await Promise.all([
            postMatchHistory(payloadP1, user?.accessToken),
            postMatchHistory(payloadP2, user?.accessToken),
          ]);

          // Tournament history, one post P1 perspective
          const tournament_id = (tournamentTitle ?? '').trim();
          if (tournament_id) {
            const stage_number = stageForPosting(roundNum, bracketSize || entrants.length || 2);
            const resultForP1: 'win' | 'loss' | 'draw' =
              s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw';

            await postTournamentHistory({
              tournament_id,
              stage_number,
              match_number: matchIdx + 1, // 1-based within the round
              player_name: p1.username,
              opponent_name: p2.username,
              result: resultForP1,
            });
          }
        } else {
          // Regular match
          const p1 = rawPlayers?.[0] as any;
          const p2 = rawPlayers?.[1] as any;

          if (p1?.id && p1?.username && p2?.id && p2?.username) {
            // both sides registered, post twice
            const payloadP1 = {
              player_id: String(p1.id),
              player_username: p1.username,
              player_name: p1.username,
              opponent_id: String(p2.id),
              opponent_username: p2.username,
              opponent_name: p2.username,
              player_score: s1,
              opponent_score: s2,
              duration: durationStr,
              result: s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw',
              played_at: played_at_iso,
            } as const;

            const payloadP2 = {
              player_id: String(p2.id),
              player_username: p2.username,
              player_name: p2.username,
              opponent_id: String(p1.id),
              opponent_username: p1.username,
              opponent_name: p1.username,
              player_score: s2,
              opponent_score: s1,
              duration: durationStr,
              result: s2 > s1 ? 'win' : s2 < s1 ? 'loss' : 'draw',
              played_at: played_at_iso,
            } as const;

            await Promise.all([
              postMatchHistory(payloadP1, user?.accessToken),
              postMatchHistory(payloadP2, user?.accessToken),
            ]);
          } else {
            // Against guest, only post registered user stats
            const player_id = user?.id ?? (rawPlayers?.[0] as any)?.id ?? 'guest';
            const player_username = user?.username ?? (rawPlayers?.[0]?.username ?? 'Player 1');
            const opp = (rawPlayers?.[1] as any) ?? {};
            const oppId = opp?.id ? String(opp.id) : null;
            const oppUsername = opp?.username ?? 'guest';

            await postMatchHistory({
              player_id,
              player_username,
              player_name: player_username,
              opponent_id: oppId,
              opponent_username: oppUsername,
              opponent_name: oppUsername,
              player_score: s1,
              opponent_score: s2,
              duration: durationStr,
              result: s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw',
              played_at: played_at_iso,
            }, user?.accessToken);
          }
        }

        setSubmitted(true);
        afterSubmitUI();
      } catch (err: any) {
        if (!isTournament) {
          setPostResult({ winner: winnerName, s1, s2 });
          setPhase('post');
        }
      }
    }

    await submitAll();
  };

  const handlePlayAgain = () => {
    // Return to options and remove the game from the background for a clean start option
    setPhase('options');
    setPostResult(null);
  };

  // Page elements
  return (
    <div className="flex flex-col items-center -mt-6 md:-mt-10 lg:-mt-3 space-y-2">
      <div className="w-9/10 mx-auto">

        {/* Match Options */}
        {!isTournament && phase === 'options' && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">Match Options</h2>

                <fieldset className="mb-6">
                  <legend className="block text-sm text-neutral-300 mb-2">Base Ball Speed</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slow','medium','fast'] as SpeedPreset[]).map(opt => (
                      <label key={opt} className="flex items-center gap-2 rounded-lg bg-neutral-800 p-2 cursor-pointer">
                        <input
                          type="radio"
                          name="speed"
                          value={opt}
                          checked={speedPreset === opt}
                          onChange={() => setSpeedPreset(opt)}
                        />
                        <span className="capitalize">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    Actual speed: {baseSpeed.toFixed(3)}
                  </div>
                </fieldset>

                <label className="block mb-6">
                  <span className="block text-sm text-neutral-300 mb-1">Win Condition</span>
                  <select
                    className="w-full rounded-lg bg-neutral-800 p-2"
                    value={winMode}
                    onChange={(e) => setWinMode(e.target.value as WinMode)}
                  >
                    <option value="bo5">Best of 5</option>
                    <option value="bo9">Best of 9</option>
                    <option value="bo19">Best of 19</option>
                  </select>
                </label>

                <label className="block mb-6">
                  <span className="block text-sm text-neutral-300 mb-1">Map</span>
                  <select
                    className="w-full rounded-lg bg-neutral-800 p-2 text-neutral-100"
                    value={mapKey}
                    onChange={(e) => setMapKey(e.target.value as MapKey)}
                  >
                    <option value="default">Default</option>
                    <option value="large">Large</option>
                    <option value="obstacles">Obstacles</option>
                  </select>
                  <div className="text-xs mt-1 opacity-80">
                    {mapKey === 'default' && 'Initial test version.'}
                    {mapKey === 'large' && 'Double the size'}
                  </div>
                </label>

                {/* Controls */}
                  <KeyBindingsPanel
                    playerNames={[p1Name, p2Name]}
                    value={bindings}
                    onChange={setBindings}
                  />

                <div className="flex justify-center">
                  <button
                    onClick={handleStart}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                  >
                    Start Match
                  </button>
                </div>
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
                  Round {roundNum} • Match {matchIdx + 1} / {pairs.length}
                </div>
                <h2 className="text-2xl font-bold mb-6">Next Match</h2>
                <div className="text-xl font-semibold mb-6">
                  {currentPair[0].username} <span className="opacity-70">vs</span> {currentPair[1].username}
                </div>

                {upcomingPair && (
                  <div className="text-xs opacity-70 mb-6">
                    Up next: {upcomingPair[0].username} vs {upcomingPair[1].username}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  Start Match
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Container */}
        {(phase === 'playing') && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center">Loading game…</div>}>
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
              Press Space to start
            </div>
            <div
              id="scoreBoard"
              className="absolute top-9 left-1/2 transform -translate-x-1/2 font-mono text-xl text-green-700 z-10 pointer-events-none"
            >
              {p1Name}: 0 | {p2Name}: 0
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
              <div className="text-4xl font-bold mb-2">Game Paused</div>
              <div className="text-base opacity-75">Press Space to continue</div>
            </div>
          </div>
        )}

        {/* Non‑tournament post-match */}
        {!isTournament && phase === 'post' && postResult && (
          <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90 text-neutral-100">
              <div className="w-full max-w-md p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Match Over</h2>
                <div className="text-lg mb-1">Winner: <span className="font-semibold">{postResult.winner}</span></div>
                <div className="text-sm opacity-80 mb-6">
                  Final Score: {postResult.s1} – {postResult.s2}
                </div>
                <button
                  onClick={handlePlayAgain}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  Play again
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
                <h2 className="text-3xl font-bold mb-4">Tournament Complete</h2>
                <div className="text-lg opacity-80 mb-6">
                  Tournament Champion:&nbsp;
                  <span className="font-semibold">
                    {[...carryToNextRound, ...winnersThisRound][0]?.username || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 rounded-2xl bg-black text-white border border-white/10 p-4" role="note" aria-label="Game controls">
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
            <div>
              <div className="font-medium mb-1">{p1Name}</div>
              <ul className="space-y-1">
                <li>
                  Move:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p1.up)}
                  </kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p1.down)}
                  </kbd>
                </li>
                <li>
                  Boost:&nbsp;
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
                  Move:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p2.up)}
                  </kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    {labelForCode(bindings.p2.down)}
                  </kbd>
                </li>
                <li>
                  Boost:&nbsp;
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
