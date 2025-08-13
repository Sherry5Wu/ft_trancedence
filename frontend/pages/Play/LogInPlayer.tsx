// /src/pages/Play/LogInPlayer.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useLocation, useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidUsername, isValidPin } from '../../utils/Validation';
import { usePlayersContext } from '../../context/PlayersContext';

const LogInPlayerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    players,
    addPlayer,
    removePlayer,
  } = usePlayersContext();

  const usernameField = useValidationField('', isValidUsername);
  const pinField = useValidationField('', isValidPin);

  const location = useLocation();
  const playerIndex: number = location.state?.playerIndex ?? 1;
  const returnTo: string = location.state?.returnTo ?? '/';

  const formFilled =
    !usernameField.error &&
    !pinField.error;

  const handleSubmit = async () => {
    try {
      const response = await fakeFetchPlayer(usernameField.value, pinField.value);
      // check if there is error on username + PIN code,
      // invalid PIN or invalid username, or any?
      const player = {
        id: response.id,
        username: response.username,
        photo: response.photo,
      };
      // to remove existing player at same index
      if (players.length > playerIndex) { 
        removePlayer(players[playerIndex].id);
      }

      addPlayer(player);
      navigate(returnTo);
    } catch (err) {
      alert(t('common.errors.invalidLogin'));
    }
  };

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.logInPlayer.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.logInPlayer.title')}
      </h1>

      <GenericInput
        type="text"
        placeholder={t('common.placeholders.username')}
        aria-label={t('common.aria.inputs.username')}
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameField.error}
      />

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.pin')}
        aria-label={t('common.aria.inputs.pin')}
        value={pinField.value}
        onFilled={pinField.onFilled}
        onBlur={pinField.onBlur}
        errorMessage={pinField.error}
      />

      <GenericButton
        className="generic-button"
        text={t('common.buttons.ok')}
        aria-label={t('common.aria.buttons.ok')}
        disabled={!formFilled}
        onClick={handleSubmit}
      />
    </main>
  );
};

export default LogInPlayerPage;

// Temporary fake fetch function (replace with actual API)
const fakeFetchPlayer = async (username: string, pin: string) => {
  await new Promise((r) => setTimeout(r, 500)); // simulate delay
  return {
    id: Date.now().toString(),
    username,
    photo: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
  };
};
