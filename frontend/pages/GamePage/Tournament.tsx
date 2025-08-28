import { useCallback, useEffect, useMemo, useState } from 'react';

export type Player = { id: string; username: string; elo: number };
export type Pair = [Player, Player];

// Helpers for tournament stages
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
const normalizeElo = (elo: unknown): number => {
  const n = Number(elo);
  return Number.isFinite(n) && n > 0 ? n : 1000; // base elo
};

// Sort players by their ranking, highest vs lowest in a tournament
function seedHighVsLow(players: Player[], bracketSize?: number): { pairs: Pair[]; carry: Player[] } {
  const normalized = players.map(p => ({ ...p, elo: normalizeElo(p.elo) }));
  const sorted = [...normalized].sort((a, b) => {
    const d = b.elo - a.elo;
    if (d !== 0) return d;
    const u = a.username.localeCompare(b.username);
    if (u !== 0) return u;
    return a.id.localeCompare(b.id);
  });
  const targetSize = bracketSize ?? nextPow2(sorted.length);
  const byes = Math.max(0, targetSize - sorted.length);
  const carry: Player[] = sorted.slice(0, byes);
  const pool = sorted.slice(byes);
  const pairs: Pair[] = [];
  for (let l = 0, r = pool.length - 1; l < r; l++, r--) {
    pairs.push([pool[l], pool[r]]);
  }
  if (pool.length % 2 === 1)
    carry.push(pool[(pool.length - 1) / 2]);
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

type BracketState = {
  roundNum: number;
  pairs: Pair[];
  matchIdx: number;
  winnersThisRound: Player[];
  carryToNextRound: Player[];
};

type AdvanceResult = { completed: boolean; champion?: Player };

// Main logic for advancing brackets
export function useTournamentBracket(entrants: Player[], enabled: boolean) {
  const bracketSize = useMemo(
    () => (enabled ? nextPow2(Math.max(2, entrants.length)) : 0),
    [enabled, entrants.length]
  );

  const [state, setState] = useState<BracketState>({
    roundNum: 1,
    pairs: [],
    matchIdx: 0,
    winnersThisRound: [],
    carryToNextRound: [],
  });

  // Initialise/Reset when entrants change
  useEffect(() => {
    if (!enabled || entrants.length < 2) {
      setState({ roundNum: 1, pairs: [], matchIdx: 0, winnersThisRound: [], carryToNextRound: [] });
      return;
    }
    const { pairs, carry } = seedHighVsLow(entrants, bracketSize);
    setState({ roundNum: 1, pairs, matchIdx: 0, winnersThisRound: [], carryToNextRound: carry });
  }, [enabled, entrants, bracketSize]);

  const currentPair = state.pairs[state.matchIdx];
  const upcomingPair = state.pairs[state.matchIdx + 1];
  const pairsCount = state.pairs.length;

  const advanceByName = useCallback((winnerName: string): AdvanceResult => {
    if (!currentPair) return { completed: false };

    // Resolve winner
    const winner =
      currentPair[0].username === winnerName ? currentPair[0] :
      currentPair[1].username === winnerName ? currentPair[1] :
      currentPair[0];

    // If there are more matches in this round, move to the next match
    if (state.matchIdx + 1 < state.pairs.length) {
      setState(s => ({
        ...s,
        winnersThisRound: [...s.winnersThisRound, winner],
        matchIdx: s.matchIdx + 1,
      }));
      return { completed: false };
    }

    // End of round, collect advancing players
    const newWinners = [...state.winnersThisRound, winner];
    const allAdvancing = [...state.carryToNextRound, ...newWinners];

    // Tournament complete
    if (allAdvancing.length === 1) {
      setState(s => ({
        ...s,
        winnersThisRound: [],
        carryToNextRound: allAdvancing, // champion parked here
        pairs: [],
        matchIdx: 0,
      }));
      return { completed: true, champion: allAdvancing[0] };
    }

    // Next round
    const { pairs: nextPairs, carry: nextCarry } = pairSequential(allAdvancing);
    setState(s => ({
      roundNum: s.roundNum + 1,
      pairs: nextPairs,
      matchIdx: 0,
      winnersThisRound: [],
      carryToNextRound: nextCarry,
    }));
    return { completed: false };
  }, [currentPair, state.matchIdx, state.pairs.length, state.winnersThisRound, state.carryToNextRound]);

  return {
    bracketSize,
    pairsCount,
    currentPair,
    upcomingPair,
    roundNum: state.roundNum,
    matchIdx: state.matchIdx,
    advanceByName,
    stageForPosting: () => (bracketSize ? stageForPosting(state.roundNum, bracketSize) : 1),
  };
}
