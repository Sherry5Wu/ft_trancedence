// components/BracketMatch.tsx
 
import React from 'react';

interface BracketMatchProps {
  player1: string | null;
  player2: string | null;
  winner: 'player1' | 'player2' | null;
}

const BracketMatch: React.FC<BracketMatchProps> = ({ player1, player2, winner }) => {
  const getBorder = (player: 'player1' | 'player2') => {
    if (!winner) return 'border-gray-400';
    if (winner === player) return 'border-[#2E6F40]';
    else return 'border-[#CD1C18]';
  };

  return (
    <div className="flex flex-col w-48">
      <div
        className={`p-2 bg-[#FDFBD4] mt-2 rounded-3xl border-3 text-center ${getBorder('player1')}`}
      >
        {player1 || 'TBD'}
      </div>
      <div
        className={`p-2 bg-[#FDFBD4] mt-2 rounded-4xl border-3 text-center ${getBorder('player2')}`}
      >
        {player2 || 'TBD'}
      </div>
    </div>
  );
};

export default BracketMatch;
