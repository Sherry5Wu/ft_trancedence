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

  function getMatchKey(roundIndex: number, matchIndex: number) {
    return `${roundIndex}-${matchIndex}`;
  }

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
      </div>
    </div>
  );
};

export default ModularBracketViewer;
