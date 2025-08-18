// /src/pages/Play/ChoosePlayers.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useUserContext } from '../../context/UserContext';
import { usePlayersContext } from '../../context/PlayersContext';
import { useValidationField } from '../../utils/Hooks';
import { isValidAlias } from '../../utils/Validation';

const ChoosePlayersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const {
    players,
    addPlayer,
    removePlayer,
    resetPlayers,
    setPlayer,
    setIsTournament,
  } = usePlayersContext();

  useEffect(() => {
    setIsTournament(false);
  }, [setIsTournament]);

  const player1Field = useValidationField('', isValidAlias);
  const player2Field = useValidationField('', isValidAlias);

  const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);
  const [isPlayer1Loading, setIsPlayer1Loading] = useState(true);

// Player 1 from logged-in user
useEffect(() => {
  if (user?.username && players.length === 0) {
    const photo = user.profilePic?.props?.src ?? `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;
    const player = {
      id: user.username,
      username: user.username,
      photo,
    };
    addPlayer(player);
    player1Field.setValue(user.username);
  } else if (players.length > 0) {
    player1Field.setValue(players[0].username);
  }
  setIsPlayer1Loading(false);
}, [user, players]);

// sync second player field when players array changes
useEffect(() => {
  if (players.length > 1) {
    player2Field.setValue(players[1].username);
    if (player2Type === null)
      setPlayer2Type("registered");
  } else {
    player2Field.setValue('');
  }
}, [players]);

// sync player1 field with PlayersContext
useEffect(() => {
  const trimmed = player1Field.value.trim();
  if (!isPlayer1Loading && trimmed !== '' && !player1Field.error) {
    const updated = {
      id: user?.username ?? 'player1',
      username: trimmed,
      photo: user?.profilePic?.props?.src ?? `https://api.dicebear.com/6.x/initials/svg?seed=${trimmed}`,
    };

    if (players.length === 0) {
      addPlayer(updated);
    } else {
      setPlayer(0, updated);
    }
  }
}, [player1Field.value]);


// sync player2 field with PlayersContext
useEffect(() => {
  const trimmed = player2Field.value.trim();
  if (trimmed === '' || player2Field.error) return;

  const id = player2Type === 'guest'
    ? `guest-${trimmed.toLowerCase()}`
    : trimmed;

  const photo = player2Type === 'guest'
    ? `https://api.dicebear.com/6.x/initials/svg?seed=${trimmed}`
    : players[1]?.photo ?? `https://api.dicebear.com/6.x/initials/svg?seed=${trimmed}`;

  const updated = { id, username: trimmed, photo };

  if (players.length > 1) {
    setPlayer(1, updated);
  } else if (players.length === 1) {
    addPlayer(updated);
  }
}, [player2Field.value]);


const aliasDuplicate =
  player1Field.value.trim().toLowerCase() === player2Field.value.trim().toLowerCase() &&
  player1Field.value.trim() !== '';

const formFilled =
  player1Field.value.trim() !== '' &&
  player2Field.value.trim() !== '' &&
  !player1Field.error &&
  !player2Field.error &&
  !aliasDuplicate;

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.choosePlayers.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.choosePlayers.title')}
      </h1>

      <GenericInput
        type="text"
        placeholder={t('common.placeholders.player1')}
        aria-label={t('common.aria.inputs.playerAlias')}
        value={player1Field.value}
        onFilled={player1Field.onFilled}
        onBlur={player1Field.onBlur}
        errorMessage={
          player1Field.error ||
          (aliasDuplicate ? t('common.errors.duplicateAlias') : '')
        }
        disabled={isPlayer1Loading}
        showEditIcon={true}
      />

      <div className="flex flex-wrap justify-center gap-6 mt-4">
        <GenericButton
          className={`generic-button ${player2Type === "registered" ? "" : "unclicked-button"}`}
          text={t('pages.choosePlayers.player2TypeRegistered')}
          aria-label={t('pages.choosePlayers.aria.player2TypeRegisteredButton')}
          onClick={() => {
            navigate("/login-player", {
              state: {
                context: "generic",
                playerIndex: 1,
                returnTo: "/choose-players"
              }
            });
          }}
        />
        <GenericButton
          className={`generic-button ${player2Type === "guest" ? "" : "unclicked-button"}`}
          text={t('pages.choosePlayers.player2TypeGuest')}
          aria-label={t('pages.choosePlayers.aria.player2TypeGuestButton')}
          onClick={() => {
            setPlayer2Type("guest");
            player2Field.setValue('');
            removePlayer(players[1]?.id);
            alert(t('pages.choosePlayers.player2GuestAlert'));
          }}
        />
      </div>

      {player2Type && (
        <div className="mt-4">
          <GenericInput
            type="text"
            placeholder={t('common.placeholders.player2')}
            aria-label={t('common.aria.inputs.playerAlias')}
            value={player2Field.value}
            onFilled={player2Field.onFilled}
            onBlur={player2Field.onBlur}
            errorMessage={
              player2Field.error ||
              (aliasDuplicate ? t('common.errors.duplicateAlias') : '')
            }
            showEditIcon={true}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.cancel')}
          aria-label={t('common.aria.buttons.cancel')}
          onClick={() => {
            resetPlayers();
            navigate('/homeuser');
          }}
        />
        <GenericButton
          className="generic-button"
          text={t('common.buttons.play')}
          aria-label={t('common.aria.buttons.play')}
          disabled={!formFilled}
          onClick={() => {
            navigate('/game');
          }}
        />
      </div>
    </main>
  );
};

export default ChoosePlayersPage;  