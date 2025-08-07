// components/ToBeDoneBracket.tsx

import React from 'react';

interface ToBeDoneBracketProps {
  tournament: {
    title: string;
    date: string;
    totalPlayers: number;
    finalWinner: string;
  };
}

const ToBeDoneBracket: React.FC<ToBeDoneBracketProps> = ({ tournament }) => {
  return (
    <div className="p-4 bg-[#FFEE8C] rounded-xl scale-x-105">
      <p className="font-semibold">[Tournament details and Bracket]</p>
      <p>Bracket for: <strong>{tournament.title}</strong></p>
      <p>Date: {tournament.date}</p>
      <p>Total Players: {tournament.totalPlayers}</p>
      <p>Winner: {tournament.finalWinner}</p>
    </div>
  );
};

export default ToBeDoneBracket;
