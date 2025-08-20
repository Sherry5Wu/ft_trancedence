// /src/pages/Tornament/TournamentNew.tsx

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { DropDownButton } from '../../components/DropDownButton';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { useValidationField } from '../../utils/Hooks';
import { isValidTitle } from '../../utils/Validation';
import { useUserContext } from '../../context/UserContext';
import { usePlayersContext } from '../../context/PlayersContext';

const NewTournamentPage: React.FC = () => {
  const { t } = useTranslation();  
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
    setIsTournament,
  } = usePlayersContext();

  const titleField = useValidationField(tournamentTitle || '', isValidTitle,  t('common.errors.invalidTitle'));

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
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.tournament.new.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.tournament.new.title')}
      </h1>

      <section
        className="space-y-4 w-full max-w-md"
        aria-label={t('pages.tournament.new.aria.form')}
      >
        <GenericInput
          type="text"
          placeholder={t('pages.tournament.new.placeholders.tournamentTitle')}
          value={titleField.value}
          onFilled={handleTitleChange}
          onBlur={titleField.onBlur}
          errorMessage={titleField.error}
          aria-label={t('pages.tournament.new.aria.inputTitle')}
        />

        <DropDownButton
          label={t('pages.tournament.new.placeholders.totalPlayers')}
          options={['4', '8', '16']}
          onSelect={handlePlayerCountSelect}
          selected={totalPlayers?.toString() ?? ''}
          aria-label={t('pages.tournament.new.aria.totalPlayersSelect')}
        />
      </section>

      {totalPlayers !== null && (
        <section
          className="grid grid-cols-4 gap-4 mt-6"
          aria-label={t('pages.tournament.new.aria.playersSection')}
        >
          {displayPlayers.map((player, idx) => (
            <UserProfileBadge
              size="sm"
              key={idx}
              user={player}
              onClick={() => handlePlayerClick(idx)}
              aria-label={
                player
                  ? t('pages.tournament.new.aria.playerBadge', {
                      username: player.username,
                      index: idx + 1,
                    })
                  : t('pages.tournament.new.aria.playerEmpty', {
                      index: idx + 1,
                    })
              }
            />
          ))}
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.cancel')}
          aria-label={t('common.aria.buttons.cancel')}
          onClick={() => {
            setIsTournament(false);
            resetPlayers();
            navigate('/tournaments');
          }}
        />
        <GenericButton
          className="generic-button"
          text={t('common.buttons.next')}
          aria-label={t('common.aria.buttons.next')}
          disabled={!formFilled}
          onClick={() => {
            setIsTournament(true);
            navigate('/tournaments/new/players');
          }}
        />
      </div>
    </main>
  );
};

export default NewTournamentPage;