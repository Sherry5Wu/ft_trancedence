import React from 'react';

interface BracketMatchProps {
  player1: string | null;
  player2: string | null;
  winner: 'player1' | 'player2' | null;
}

const BracketMatch: React.FC<BracketMatchProps> = ({ player1, player2, winner }) => {
  const bgColor = (player: 'player1' | 'player2') => {
    if (!winner) return 'bg-gray-300';
    return winner === player ? 'bg-[#FFCC00]' : 'bg-[#FDFBD4]';
  };

  return (
    <div className="flex flex-col w-48 ">
      <div className={`p-2 mt-2 rounded-3xl border-2 text-center ${bgColor('player1')}`}>{player1 || 'TBD'}</div>
      <div className={`p-2 mt-2 rounded-3xl border-2 text-center ${bgColor('player2')}`}>{player2 || 'TBD'}</div>
    </div>
  );
};

export default BracketMatch;
