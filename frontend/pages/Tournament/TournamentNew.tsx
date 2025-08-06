// pages/Tornament/TournamentNew.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { TopDownButton } from '../../components/TopDownButton';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidTitle } from '../../utils/Validation';
import { useUserContext } from '../../context/UserContext';
import { usePlayersContext } from '../../context/PlayersContext';

const NewTournamentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const {
    players,
    setPlayer,
    setTitle,
    setTotalPlayers,
    totalPlayers,
    tournamentTitle,
    resetPlayers,
    resetPlayerListOnly,
  } = usePlayersContext();

  const titleField = useValidationField(tournamentTitle || '', isValidTitle);

  useEffect(() => {
    // Load logged-in user as player[0] if not already set
    if (user?.username && !players[0]) {
      const profilePic =
        user.profilePic?.props?.src ??
        `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;

      setPlayer(0, {
        id: user.username,
        username: user.username,
        photo: profilePic,
      });
    }
  }, [user, players, setPlayer]);

  const handlePlayerCountSelect = (value: string) => {
    const num = parseInt(value);
    setTotalPlayers(num);
    resetPlayerListOnly();

    // Set player[0] again
    if (user?.username) {
      const profilePic =
        user.profilePic?.props?.src ??
        `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;
      setPlayer(0, {
        id: user.username,
        username: user.username,
        photo: profilePic,
      });
    }
  };

  const handleTitleChange = (value: string) => {
    titleField.onFilled(value);
    setTitle(value); // sync to context
  };

  const handlePlayerClick = (index: number) => {
    if (index === 0)
      return;
    navigate('/login-player', {
      state: {
        context: 'tournament',
        playerIndex: index,
        returnTo: '/tournaments/new',
      },
    });
  };

  const displayPlayers = Array.from({ length: totalPlayers ?? 0 }).map(
    (_, idx) => players[idx] ?? null
  );

  const formFilled =
    titleField.value.trim() !== '' &&
    !titleField.error &&
    totalPlayers !== null &&
    players.length === totalPlayers &&
    players.every((p) => p !== undefined && p !== null);

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">New tournament</h3>

      <div className="space-y-4">
        <GenericInput
          type="text"
          placeholder="Tournament title"
          value={titleField.value}
          onFilled={handleTitleChange}
          onBlur={titleField.onBlur}
          errorMessage={titleField.error}
        />

        <TopDownButton
          label="Total players"
          options={['4', '8', '16']}
          onSelect={handlePlayerCountSelect}
          selected={totalPlayers?.toString() ?? ''}
        />
      </div>

      {totalPlayers !== null && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {displayPlayers.map((player, idx) => (
            <UserProfileBadge
              key={idx}
              user={player}
              onClick={() => handlePlayerClick(idx)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <GenericButton
          className="generic-button"
          text="CANCEL"
          onClick={() => {
            resetPlayers();
            navigate('/tournaments');
          }}
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
