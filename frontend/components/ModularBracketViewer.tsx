import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Result, TournamentHistoryRow, ModularBracketViewerProps} from '../utils/Interfaces';

const MatchCard: React.FC<{
  player1: string | null;
  player2: string | null;
  winner: 'player1' | 'player2' | null;
}> = ({ player1, player2, winner }) => {
  const p1Border = !winner ? 'border-gray-400' : winner === 'player1' ? 'border-[#2E6F40]' : 'border-[#CD1C18]';
  const p2Border = !winner ? 'border-gray-400' : winner === 'player2' ? 'border-[#2E6F40]' : 'border-[#CD1C18]';

  return (
    <div className="w-52 p-2 rounded-2xl">
      <div className={`p-2 rounded-3xl border-3 text-center ${p1Border}`}>{player1 ?? 'TBD'}</div>
      <div className={`p-2 rounded-3xl border-3 text-center mt-2 ${p2Border}`}>{player2 ?? 'TBD'}</div>
    </div>
  );
};

function groupRounds(matches: TournamentHistoryRow[], totalPlayers: number) {
  const roundsCount = Math.round(Math.log2(totalPlayers));
  const rounds: TournamentHistoryRow[][] = [];
  for (let i = 0; i < roundsCount; i++) {
    const stage = roundsCount - i;
    const roundMatches = matches
      .filter((m) => m.stage_number === stage)
      .sort((a, b) => a.match_number - b.match_number);
    rounds.push(roundMatches);
  }
  return rounds;
}

const ModularBracketViewer: React.FC<ModularBracketViewerProps> = ({
  matches,
  totalPlayers: totalPlayersProp,
  roundGap = 120,
  matchGap = 28,
}) => {
  const inferredPlayers = useMemo(() => {
    if (totalPlayersProp) return totalPlayersProp;
    const maxStage = Math.max(...matches.map((m) => m.stage_number));
    return Math.pow(2, maxStage);
  }, [totalPlayersProp, matches]);

  const totalPlayers = inferredPlayers;
  const rounds = useMemo(() => groupRounds(matches, totalPlayers), [matches, totalPlayers]);

  const matchRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [layoutsReady, setLayoutsReady] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setLayoutsReady(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [matches, rounds.length]);

  function getMatchKey(roundIndex: number, matchIndex: number) {
    return `${roundIndex}-${matchIndex}`;
  }

  function measureRect(key: string) {
    const el = matchRefs.current.get(key);
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  const paths = useMemo(() => {
    if (!layoutsReady) return [];
    const svgEl = svgRef.current;
    if (!svgEl) return [];
    const svgRect = svgEl.getBoundingClientRect();

    const result: { d: string; key: string }[] = [];

    for (let rIndex = 0; rIndex < rounds.length; rIndex++) {
      const roundMatches = rounds[rIndex];
      const nextRoundMatches = rounds[rIndex + 1] ?? [];

      for (let m = 0; m < roundMatches.length; m++) {
        const match = roundMatches[m];
        const winnerName =
          match.result === 'win'
            ? match.player_name
            : match.result === 'loss'
            ? match.opponent_name
            : null;

        if (!winnerName) continue;

        let parentKey: string | null = null;
        if (nextRoundMatches.length > 0) {
          const parentIndex = nextRoundMatches.findIndex(
            (nm) => nm.player_name === winnerName || nm.opponent_name === winnerName
          );
          if (parentIndex !== -1) parentKey = getMatchKey(rIndex + 1, parentIndex);
        } else {
          parentKey = 'winner-column';
        }

        const fromKey = getMatchKey(rIndex, m);
        const fromRect = measureRect(fromKey);
        const toRect =
          parentKey === 'winner-column' ? measureRect(parentKey) : parentKey ? measureRect(parentKey) : null;
        if (!fromRect || !toRect) continue;

        const startX = fromRect.right - svgRect.left;
        const startY = fromRect.top + fromRect.height / 2 - svgRect.top;
        const endX = toRect.left - svgRect.left;
        const endY = toRect.top + toRect.height / 2 - svgRect.top;

        const midX = startX + (endX - startX) / 2;

        // Draw simple right-angled path:
        // Horizontal from startX to midX
        // Vertical from startY to endY
        // Horizontal from midX to endX
        const d = [
          `M ${startX} ${startY}`,   // move to start
          `H ${midX}`,              // horizontal line to midX
          `V ${endY}`,              // vertical line to endY
          `H ${endX}`,              // horizontal line to endX (end)
        ].join(' ');

        result.push({ d, key: `${fromKey}->${parentKey}` });
      }
    }

    return result;
  }, [layoutsReady, rounds]);

  const finalMatch = rounds[rounds.length - 1]?.[0];
  let tournamentWinner = 'TBD';
  if (finalMatch) {
    if (finalMatch.result === 'win') tournamentWinner = finalMatch.player_name ?? 'TBD';
    else if (finalMatch.result === 'loss') tournamentWinner = finalMatch.opponent_name ?? 'TBD';
  }

  return (
    <div className="w-202 flex justify-center items-center bg-[#FFEE8C] rounded-xl -translate-x-5">
      <div className="relative flex justify-center items-center scale-80">
        <div className="relative z-10 flex items-center gap-8" >
          {rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="flex flex-col items-center gap-6">
              <div className="mb-2 font-semibold">
                {rounds.length - roundIndex === 1 ? 'Final' : `Round ${roundIndex + 1}`}
              </div>
              {round.map((match, matchIdx) => {
                const winner = match.result === 'draw' ? null : match.result === 'win' ? 'player1' : 'player2';
                const key = getMatchKey(roundIndex, matchIdx);
                return (
                  <div key={key} ref={(el) => matchRefs.current.set(key, el)}>
                    <MatchCard player1={match.player_name} player2={match.opponent_name} winner={winner} />
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex flex-col items-center ml-8">
            <div className="mb-2 font-semibold">Winner</div>
            <div
              ref={(el) => matchRefs.current.set('winner-column', el)}
              className={`w-50 p-2 rounded-3xl border-3 ${
                tournamentWinner === 'TBD' ? 'border-gray-400' : 'border-[#2E6F40]'
              } text-center font-bold`}
            >
              {tournamentWinner}
            </div>
          </div>
        </div>
        {/* <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {paths.map((p) => (
            <path key={p.key} d={p.d} stroke="#444" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          ))}
        </svg> */}
      </div>
    </div>
  );
};

export default ModularBracketViewer;
