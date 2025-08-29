// components/BracketViewer.tsx

import React from 'react';
import BracketMatch from './BracketMatch';
import WinnerIcon from '../assets/noun-winner-7818361.svg?react'

interface TournamentHistoryRow {
  stage_number: number;
  match_number: number;
  player_name: string | null;
  opponent_name: string | null;
  result: 'win' | 'loss' | 'draw';
}

interface BracketViewerProps {
  matches: TournamentHistoryRow[];
}

const BracketViewer: React.FC<BracketViewerProps> = ({ matches }) => {
  
  if (matches.length === 0) return <p>No matches available</p>;

  const rounds = Array.from(new Set(matches.map(m => m.stage_number))).sort((a, b) => b - a);

  // Determine winner
  let tournamentWinner = 'TBD';
  const finalStage = Math.min(...matches.map(m => m.stage_number).filter(n => n > 0));
  const finalMatch = matches.find(m => m.stage_number === finalStage);

// const finalStage = 1; // finals stage fixed
// const finalMatch = matches.find(m => m.stage_number === finalStage);

  if (finalMatch) {
    if (finalMatch.result === 'win') {
      tournamentWinner = finalMatch.player_name || 'TBD';
    } else if (finalMatch.result === 'loss') {
      tournamentWinner = finalMatch.opponent_name || 'TBD';
    }
  }


  return (
    <div className="flex gap-10 p-10 overflow-x-auto bg-[#FFEE8C] rounded-xl scale-x-105">
      {rounds.map(round => (
        <div key={round} className="flex flex-col items-center gap-8">
          <h4 className="font-semibold">Round {round}</h4>
          {matches
            .filter(m => m.stage_number === round)
            .sort((a, b) => a.match_number - b.match_number)
            .map((match, idx) => (
              <BracketMatch
                key={`${round}-${idx}`}
                player1={match.player_name}
                player2={match.opponent_name}
                winner={
                  match.result === 'draw'
                    ? null
                    : match.result === 'win'
                    ? 'player1'
                    : 'player2'
                }
              />
            ))}
        </div>
      ))}
      {/* Winner column  */}
    <div className="flex flex-col items-center gap-8">
        <h4 className="font-semibold">Winner</h4>
        <div className="flex flex-col w-48">
            <div
            className={`p-2 bg-[#FDFBD4] mt-2 rounded-3xl border-3 font-bold
                ${tournamentWinner === 'TBD' ? 'border-gray-400' : 'border-[#2E6F40]'}
                flex items-center justify-center text-center`}>
            {tournamentWinner}
            </div>
        </div>
    </div>

    </div>
  );
};

export default BracketViewer;
