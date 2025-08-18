import React, { useRef, useState, Suspense, useMemo, useEffect } from 'react';
import { usePlayersContext } from '../context/PlayersContext'

const GameCanvas = React.lazy(() => import('../game/main'));

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
type Action = 'up' | 'down' | 'boost' | 'shield';
type PlayerId = 'p1' | 'p2';
type KeyBinding = { up: string; down: string; boost: string, shield: string };
type KeyBindings = { p1: KeyBinding; p2: KeyBinding };

const DEFAULT_BINDINGS: KeyBindings = {
  p1: { up: 'KeyW', down: 'KeyS', boost: 'KeyA', shield: 'KeyD' },
  p2: { up: 'ArrowUp', down: 'ArrowDown', boost: 'ArrowRight', shield: 'ArrowLeft' },
};

const BINDINGS_STORAGE_KEY = 'pong.bindings.v1';

function loadBindings(): KeyBindings {
  try {
    const raw = localStorage.getItem(BINDINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_BINDINGS;
    const parsed = JSON.parse(raw);
    if (parsed?.p1?.up && parsed?.p2?.up) return parsed as KeyBindings;
  } catch {}
  return DEFAULT_BINDINGS;
}

function saveBindings(b: KeyBindings) {
  try { localStorage.setItem(BINDINGS_STORAGE_KEY, JSON.stringify(b)); } catch {}
}

// Display key labels
function labelForCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const special: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Space: 'Space', ShiftLeft: 'L‑Shift', ShiftRight: 'R‑Shift',
    ControlLeft: 'L‑Ctrl', ControlRight: 'R‑Ctrl',
    AltLeft: 'L‑Alt', AltRight: 'R‑Alt',
  };
  return special[code] ?? code;
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
  const { players: rawPlayers, totalPlayers, isTournament } = usePlayersContext();
  const [mapKey, setMapKey] = useState<MapKey>('default');

  // Options
  const [speedPreset, setSpeedPreset] = useState<SpeedPreset>('medium');
  const baseSpeed = useMemo(() => SPEED_MAP[speedPreset], [speedPreset]);
  const [winMode, setWinMode] = useState<WinMode>('bo5');
  const target = useMemo(() => winTarget(winMode), [winMode]);

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

  const handleStart = () => setPhase('playing');

  // Called by the main when a match finishes
  const handleMatchEnd = (winnerName: string, s1: number, s2: number) => {
    if (!isTournament) {
      setPostResult({ winner: winnerName, s1, s2 });
      setPhase('post');
      return;
    }

    // tournament progression
    const winner =
      currentPair[0].username === winnerName ? currentPair[0] :
      currentPair[1].username === winnerName ? currentPair[1] :
      currentPair[0]; // fallback

    const newWinners = [...winnersThisRound, winner];

    // If more matches left in this round, move to next prematch
    if (matchIdx + 1 < pairs.length) {
      setWinnersThisRound(newWinners);
      setMatchIdx(matchIdx + 1);
      setPhase('prematch');
      return;
    }

    // Choose next round from the winners
    const allAdvancing = [...carryToNextRound, ...newWinners];

    // Check if tournament ended
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
  };

  // Key bingings
  const [bindings, setBindings] = useState<KeyBindings>(() => loadBindings());
  // Which binding we’re currently capturing (if any)
  const [capture, setCapture] = useState<{ player: PlayerId; action: Action } | null>(null);
  // Prevent duplicate conflicts
  const enforceUnique = true;
  
  // When capturing, the next keydown sets the binding
  useEffect(() => {
    if (!capture) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const code = e.code;
      setBindings(prev => {
        if (enforceUnique) {
          for (const pid of ['p1','p2'] as PlayerId[]) {
            for (const act of ['up','down','boost','shield'] as Action[]) {
              if (!(pid === capture.player && act === capture.action) && prev[pid][act] === code) {
                return prev;
              }
            }
          }
        }
        const next = { ...prev, [capture.player]: { ...prev[capture.player], [capture.action]: code } };
        saveBindings(next);
        return next;
      });
      setCapture(null);
    };
    window.addEventListener('keydown', onKeyDown, { once: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [capture]);

  function findConflicts(b: KeyBindings): string[] {
    const all: Array<{ who: string; code: string }> = [];
    (['p1','p2'] as PlayerId[]).forEach(pid => {
      (['up','down','boost','shield'] as Action[]).forEach(act => {
        all.push({ who: `${pid}:${act}`, code: b[pid][act] });
      });
    });
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const item of all) {
      if (seen.has(item.code)) dups.push(`${seen.get(item.code)} ↔ ${item.who} (${item.code})`);
      else seen.set(item.code, item.who);
    }
    return dups;
  }
  const conflicts = findConflicts(bindings);

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
                  <div className="mb-6">
                    <div className="block text-sm text-neutral-300 mb-2">Controls</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Player 1 */}
                      <div className="rounded-lg bg-neutral-800 p-3">
                        <div className="font-semibold mb-2">{p1Name} (Player 1)</div>
                        {(['up','down','boost','shield'] as Action[]).map((act) => (
                          <div key={act} className="flex items-center justify-between gap-2 py-1">
                            <span className="capitalize text-neutral-300">{act}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-neutral-900 text-xs">
                                {labelForCode(bindings.p1[act])}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCapture({ player: 'p1', action: act })}
                                className={`px-2 py-1 rounded border text-xs ${
                                  capture?.player === 'p1' && capture?.action === act
                                    ? 'border-emerald-500 text-emerald-400'
                                    : 'border-white/10 text-neutral-200'
                                }`}
                              >
                                {capture?.player === 'p1' && capture?.action === act ? 'Press any key…' : 'Rebind'}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-3 text-xs underline"
                          onClick={() => { setBindings(b => { const next = { ...b, p1: DEFAULT_BINDINGS.p1 }; saveBindings(next); return next; }); }}
                        >
                          Reset P1 to defaults
                        </button>
                      </div>
                      
                      {/* Player 2 */}
                      <div className="rounded-lg bg-neutral-800 p-3">
                        <div className="font-semibold mb-2">{p2Name} (Player 2)</div>
                        {(['up','down','boost','shield'] as Action[]).map((act) => (
                          <div key={act} className="flex items-center justify-between gap-2 py-1">
                            <span className="capitalize text-neutral-300">{act}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded bg-neutral-900 text-xs">
                                {labelForCode(bindings.p2[act])}
                              </span>
                              <button
                                type="button"
                                onClick={() => setCapture({ player: 'p2', action: act })}
                                className={`px-2 py-1 rounded border text-xs ${
                                  capture?.player === 'p2' && capture?.action === act
                                    ? 'border-emerald-500 text-emerald-400'
                                    : 'border-white/10 text-neutral-200'
                                }`}
                              >
                                {capture?.player === 'p2' && capture?.action === act ? 'Press any key…' : 'Rebind'}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-3 text-xs underline"
                          onClick={() => { setBindings(b => { const next = { ...b, p2: DEFAULT_BINDINGS.p2 }; saveBindings(next); return next; }); }}
                        >
                          Reset P2 to defaults
                        </button>
                      </div>
                    </div>
                      
                    {conflicts.length > 0 && (
                      <div className="mt-2 text-xs text-amber-400">
                        Conflicts detected: {conflicts.join(', ')}
                      </div>
                    )}
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => { setBindings(DEFAULT_BINDINGS); saveBindings(DEFAULT_BINDINGS); }}
                      >
                        Reset all to defaults
                      </button>
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => {
                          setBindings(b => {
                            const swapped: KeyBindings = { p1: b.p2, p2: b.p1 };
                            saveBindings(swapped);
                            return swapped;
                          });
                        }}
                      >
                        Swap P1/P2
                      </button>
                    </div>
                  </div>

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
