// pages/Tornament/TournamentNew.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { TopDownButton } from '../../components/TopDownButton';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidTitle } from '../../utils/Validation';

const NewTournamentPage: React.FC = () => {
  const navigate = useNavigate();

  const titleField = useValidationField('', isValidTitle);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [players, setPlayers] = useState<(null | { photoUrl?: string })[]>([]);

  const formFilled =
    titleField.value.trim() !== '' &&
    !titleField.error &&
    totalPlayers !== null &&
    players.length === totalPlayers &&
    players.every((p) => p !== null);

  const handlePlayerCountSelect = (value: string) => {
    const num = parseInt(value);
    setTotalPlayers(num);
    setPlayers(Array(num).fill(null)); // reset players
  };

  const handlePlayerClick = (index: number) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = updated[index] ? null : { photoUrl: undefined }; // Simulate user go to /login-player 
      return updated;
    });
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">New tournament</h3>

      <div className="space-y-4">
        <GenericInput
          type="text"
          placeholder="Tournament title"
          value={titleField.value}
          onFilled={titleField.onFilled}
          onBlur={titleField.onBlur}
          errorMessage={titleField.error}
        />

        <TopDownButton
          label="Total players"
          options={['4', '8', '16']}
          onSelect={handlePlayerCountSelect}
        />
      </div>

      {totalPlayers !== null && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {players.map((player, idx) => (
            <UserProfileBadge
              key={idx}
              user={player}
              onClick={() => handlePlayerClick(idx)}
              // save user infos from /login-player and use it here as well on TournamentConfirm.tsx
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <GenericButton
          className="generic-button"
          text="CANCEL"
          onClick={() => navigate('/tournaments')}
        />
        <GenericButton
          className="generic-button"
          text="NEXT"
          disabled={!formFilled}
          onClick={() => {
            navigate('/tournaments/new/players');
          }}
        />
      </div>
    </div>
  );
};

export default NewTournamentPage;
