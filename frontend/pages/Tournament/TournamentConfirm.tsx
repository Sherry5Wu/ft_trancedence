// pages/Tornament/TournamenConfirm.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { isValidAlias } from '../../utils/Validation';
import { usePlayersContext } from '../../context/PlayersContext';

interface AliasField {
  value: string;
  error: string;
  touched: boolean;
}

const TournamentConfirm: React.FC = () => {
  const navigate = useNavigate();
  const { players, totalPlayers, setPlayerUsername } = usePlayersContext();

  const [aliasFields, setAliasFields] = useState<AliasField[]>([]);

  // 1. Sync players into alias fields on mount
  useEffect(() => {
    const fields = Array.from({ length: totalPlayers ?? 0 }, (_, i) => {
      const player = players[i];
      const name = player?.username || `Player ${i + 1}`;
      return {
        value: name,
        error: '',
        touched: false,
      };
    });

    setAliasFields(fields);
  }, [players, totalPlayers]);

  // 2. AFTER aliasFields is initialized, sync back valid usernames to context
  useEffect(() => {
    aliasFields.forEach((field, idx) => {
      const player = players[idx];
      if (
        player &&
        field.value &&
        field.error === '' &&
        player.username !== field.value
      ) {
        setPlayerUsername(player.id, field.value);
      }
    });
  }, [aliasFields, players, setPlayerUsername]);

  const validateAlias = (value: string, index: number, allAliases: string[]): string => {
    const trimmed = value.trim();
    if (!isValidAlias(trimmed)) return 'Invalid alias';

    const lowerValue = trimmed.toLowerCase();
    const occurrences = allAliases.filter(
      (v, i) => i !== index && v.trim().toLowerCase() === lowerValue
    );

    if (occurrences.length > 0) return 'Alias must be unique';
    return '';
  };

  const handleAliasChange = (index: number, newValue: string) => {
    setAliasFields((prev) => {
      const updated = [...prev];
      updated[index].value = newValue;
      updated[index].touched = true;

      const allAliases = updated.map((f) => f.value);
      updated[index].error = validateAlias(newValue, index, allAliases);

      return updated;
    });
  };

  const handleBlur = (index: number) => {
    setAliasFields((prev) => {
      const updated = [...prev];
      updated[index].touched = true;

      const allAliases = updated.map((f) => f.value);
      updated[index].error = validateAlias(updated[index].value, index, allAliases);
      return updated;
    });
  };

  const formFilled =
    aliasFields.every((f) => f.value.trim() !== '') &&
    aliasFields.every((f) => f.error === '');

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center text-xl">Choose player aliases</h3>

      <div className="flex flex-col gap-4 mt-6 w-full max-w-xl">
        {aliasFields.map((field, idx) => {
          const player = players[idx] ?? null;

          return (
            <div key={idx} className="flex items-center gap-4">
              <UserProfileBadge size="sm" user={player} disabled />
              <GenericInput
                type="text"
                placeholder={`Player ${idx + 1}`}
                value={field.value}
                onFilled={(val: string) => handleAliasChange(idx, val)}
                onBlur={() => handleBlur(idx)}
                showEditIcon
                errorMessage={field.error}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/tournaments/new')}
        />
        <GenericButton
          className="generic-button"
          text="START"
          disabled={!formFilled}
          onClick={() => navigate('/game')}
        />
      </div>
    </div>
  );
};

export default TournamentConfirm;