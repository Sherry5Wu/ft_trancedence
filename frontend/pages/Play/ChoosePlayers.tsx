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
import { Tooltip } from '../../components/Tooltip';

const dicebearUrl = (seed: string) =>
  `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffee8c&textColor=000000&fontFamily=Jost`;

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

  const player1Field = useValidationField('', isValidAlias, t('common.errors.invalidAlias'));
  const player2Field = useValidationField('', isValidAlias, t('common.errors.invalidAlias'));

  const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);
  const [isPlayer1Loading, setIsPlayer1Loading] = useState(true);

// Player 1 from logged-in user
useEffect(() => {
  if (user?.username && players.length === 0) {
    const photo = user.profilePic ?? `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`;
    const player = {
      id: user.id,
      username: user.username,
      playername: user.username,
      photo,
    };
    addPlayer(player);
    player1Field.setValue(user.username);
  } else if (players.length > 0) {
    const alias = players[0].playername;
    if (alias !== player1Field.value) {
      player1Field.setValue(alias);
    }
  }
  setIsPlayer1Loading(false);
}, [user, players]);

// sync second player field when players array changes
useEffect(() => {
  if (players.length > 1) {
    const alias = players[1].playername;
    if (alias !== player2Field.value) {
      player2Field.setValue(alias);
    }
    if (player2Type === null) setPlayer2Type("registered");
  } else {
    if (player2Field.value !== '') player2Field.setValue('');
  }
}, [players]);

const handleP1Filled = (v: string) => {
  player1Field.onFilled(v); // local only while typing
};

// sync player1 field with PlayersContext
const handleP1Blur = () => {
  player1Field.onBlur();
  const trimmed = player1Field.value.trim();
  if (!isPlayer1Loading && trimmed && !player1Field.error && players[0]) {
    const next = {
      ...players[0],
      playername: trimmed,
      photo: players[0].photo?.includes('dicebear.com')
        ? dicebearUrl(trimmed)
        : players[0].photo,
    };
    setPlayer(0, next);
  }
};

const handleP2Filled = (v: string) => {
  player2Field.onFilled(v); // local only while typing
};

// sync player2 field with PlayersContext
const handleP2Blur = () => {
  player2Field.onBlur();
  const trimmed = player2Field.value.trim();
  if (!trimmed || player2Field.error || !player2Type) return;

  if (player2Type === 'guest') {
    const existing = players[1];
    const base = {
      id: 'guest',
      username: 'guest',
      playername: trimmed,
      photo: dicebearUrl(trimmed),
    };
    if (existing) {
      setPlayer(1, { ...existing, ...base });
    } else if (players.length === 1) {
      addPlayer(base);
    }
  } else {
    if (!players[1]) return;
    const next = {
      ...players[1],
      playername: trimmed,
      photo: players[1].photo?.includes('dicebear.com')
        ? dicebearUrl(trimmed)
        : players[1].photo,
    };
    setPlayer(1, next);
  }
};


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

      <h1 id="pageTitle" className="h1 font-semibold text-center">
        {t('pages.choosePlayers.title')}
      </h1>

      <div className="flex flex-col justify-center p-8 ">
   
        {/* Player 1 info */}
        <section aria-labelledby="player1Title" className="mx-auto w-[300px] text-center">
          <h2 id="player1Title" className="font-semibold text-lg mb-1">
            {t('pages.choosePlayers.player1Title', 'Player 1')}
          </h2>
          <p className="text-sm text-black mb-2">
            {t(
              'pages.choosePlayers.player1Description',
              'The user from this session is set to player 1. If the player name is not changed, the default is the username.'
            )}
          </p>
        </section>

        <GenericInput
          type="text"
          placeholder={t('common.placeholders.player1')}
          aria-label={t('common.aria.inputs.playerAlias')}
          value={player1Field.value}
          onFilled={handleP1Filled}
          onBlur={handleP1Blur}
          errorMessage={
            player1Field.error ||
            (aliasDuplicate ? t('common.errors.duplicateAlias') : '')
          }
          disabled={isPlayer1Loading}
          showEditIcon
        />

    	<section aria-labelledby="player2Title" className="mx-auto w-[300px] text-center mt-4">
        <h2 id="player2Title" className="font-semibold text-lg mb-1">
          {t('pages.choosePlayers.player2Title', 'Player 2')}
        </h2>
        <p className="text-sm text-black mb-2">
          {t(
            'pages.choosePlayers.player2Description',
          )}
        </p>
     	</section>

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <GenericButton
            className={`generic-button ${player2Type === "registered" ? "" : "unclicked-button"}`}
            text={t('pages.choosePlayers.player2TypeRegistered')}
            aria-label={t('pages.choosePlayers.aria.player2TypeRegisteredButton')}
            onClick={() => {
              setPlayer2Type("registered");
              navigate("/login-player", {
                state: {
                  context: "generic",
                  playerIndex: 1,
                  returnTo: "/choose-players"
                }
              });
            }}
          />
          <div className="relative inline-flex items-center">
            <GenericButton
              className={`generic-button ${player2Type === "guest" ? "" : "unclicked-button"}`}
              text={t('pages.choosePlayers.player2TypeGuest')}
              aria-label={t('pages.choosePlayers.aria.player2TypeGuestButton')}
              onClick={() => {
                setPlayer2Type("guest");
                player2Field.setValue('');
                if (players[1]) removePlayer(players[1].id);
              }}
            />
            <div className="absolute right-[-30px] -translate-y-2">
              <Tooltip text={t('common.tooltips.guestPlayer')} />
            </div>
          </div>
        </div>

          <div>
            <GenericInput
              type="text"
              placeholder={t('common.placeholders.player2')}
              aria-label={t('common.aria.inputs.playerAlias')}
              value={player2Field.value}
              onFilled={handleP2Filled}
              onBlur={handleP2Blur}
              errorMessage={
                player2Field.error ||
                (aliasDuplicate ? t('common.errors.duplicateAlias') : '')
              }
            	showEditIcon={true}
              	disabled={!player2Type}
            />
          </div>

        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <GenericButton
            className="generic-button"
            text={t('common.buttons.cancel')}
            aria-label={t('common.aria.buttons.cancel')}
            onClick={() => {
              resetPlayers();
              navigate(`/user/${user?.username}`);
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
      </div>
    </main>
  );
};

export default ChoosePlayersPage;