// pages/Tornament/TournamenConfirm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { GenericInput } from '../../components/GenericInput';

interface Player {
  id: number;
  name: string;
  avatarUrl?: string; // optional for badge
}

const TournamentPlayersPage: React.FC = () => {
  const navigate = useNavigate();

  // Hardcoded players list (replace with localStorage/backend later)
  const totalPlayers = 4;
  const initialPlayers: Player[] = Array.from({ length: totalPlayers }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    avatarUrl: '', // use default or avatar string if available
  }));

  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const handleAliasChange = (index: number, newName: string) => {
    setPlayers(prev =>
      prev.map((player, i) =>
        i === index ? { ...player, name: newName } : player
      )
    );
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center text-xl">Choose player aliases</h3>

<div className="flex flex-col gap-4 mt-6 w-full max-w-xl">
        {players.map((player, idx) => (
<div key={player.id} className="flex items-center\ gap-4">
            <UserProfileBadge user={player} onClick={() => {}} disabled />
            <GenericInput
              type="text"
              placeholder={`Player ${idx + 1}`}
              value={player.name}
              onFilled={(val: string) => handleAliasChange(idx, val)}
              showEditIcon={true}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/tournaments/new')}
        />
        <GenericButton
          className="generic-button"
          text="START"
          onClick={() => {
            navigate('/ping-pong');
          }}
        />
      </div>
    </div>
  );
};

export default TournamentPlayersPage;
