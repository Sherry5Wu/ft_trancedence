// components/ToBeDoneBracket.tsx

import React from 'react';
import type { toryRow } from '../pages/Tournament/TournamentsPage'; // adjust path if needed

interface ToBeDoneBracketProps {
  tournament: {
    id: string;
    date: string;
    winner: string;
    totalPlayers: number;
    matches: toryRow[];
  };
}


const ToBeDoneBracket: React.FC<ToBeDoneBracketProps> = ({ tournament }) => {
  return (
    <div className="p-4 bg-[#FFEE8C] rounded-xl scale-x-105">
      <p className="font-semibold">[Tournament details and Bracket]</p>
      <p>Bracket for: <strong>{tournament.id}</strong></p>
      <p>Date: {tournament.date}</p>
      <p>Total Players: {tournament.totalPlayers}</p>
      <p>Winner: {tournament.winner}</p>

      <div className="mt-4">
        <h4 className="font-semibold">Matches:</h4>
        <ul className="list-disc list-inside">
          {tournament.matches.map((match, i) => (
            <li key={`${match.stage_number}-${match.match_number}-${i}`}>
              <span className="font-medium">{match.player_name}</span> vs{' '}
              <span className="font-medium">{match.opponent_name}</span> →{' '}
              {match.result} ({new Date(match.played_at).toLocaleString()})
            </li>
          ))}
        </ul>
      </div>

      <div>
      </div>    

    </div>
  );
};

export default ToBeDoneBracket;
