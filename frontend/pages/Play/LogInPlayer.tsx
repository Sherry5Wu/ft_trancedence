// /src/pages/Play/LogInPlayer.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useLocation, useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useValidationField } from '../../utils/Hooks';
import { isValidUsername, isValidPin } from '../../utils/Validation';
import { usePlayersContext } from '../../context/PlayersContext';
import { loginRegisteredPlayer } from '../../utils/Fetch';
import { fetchUserProfile } from '../../utils/Fetch';
import { useUserContext } from '../../context/UserContext';

const LogInPlayerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const {
    players,
    addPlayer,
    removePlayer,
  } = usePlayersContext();

  const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const pinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));

  const location = useLocation();
  const playerIndex: number = location.state?.playerIndex ?? 1;
  const returnTo: string = location.state?.returnTo ?? '/';
  const usernameTaken = players.some(
    (p) => p.username.toLowerCase() === usernameField.value.toLowerCase()
  );

  const formFilled =
    usernameField.value.trim() !== '' &&
    pinField.value.trim() !== '' &&
    !usernameField.error &&
    !pinField.error &&
    !usernameTaken;
  
  const accessToken = user?.accessToken;

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
    if (!formFilled) return;
  
    try {
      const response = await loginRegisteredPlayer({
        username: usernameField.value,
        pinCode: pinField.value
      });

      if (!response.success || response.code !== "PIN_MATCHES") {
        if (response.code === "USER_NOT_FOUND") {
          alert(t("common.errors.userNotFound"));
        } else if (response.code === "TOO_MANY_ATTEMPTS") {
          alert(t("common.errors.tooManyAttempts"));
        } else {
          alert(t("common.errors.invalidLogin"));
        }
        return;
      }

      if (!user?.accessToken) {
        alert(t("common.errors.unauthorized"));
        return;
      }

      const playerProfile = await fetchUserProfile(usernameField.value, user.accessToken);
		console.log('PLAYER PROFILE: ', playerProfile);

      const player = playerProfile ?? {
        id: response.data?.userId || Date.now().toString(),
        username: usernameField.value,
        photo: `https://api.dicebear.com/6.x/initials/svg?seed=XX&backgroundColor=ffee8c&textColor=000000&fontFamily=Jost`, 
      };

      if (players.length > playerIndex) {
        removePlayer(players[playerIndex].id);
      }
      addPlayer(player);

      navigate(returnTo);
    } catch (err) {
      alert(t("common.errors.invalidLogin"));
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

      <form onSubmit={handleSubmit} className="flex flex-col">
      <GenericInput
        type="text"
        placeholder={t('common.placeholders.username')}
        aria-label={t('common.aria.inputs.username')}
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameTaken ? t("common.errors.playerAlreadyInContext") : usernameField.error}
      />

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.pin')}
        aria-label={t('common.aria.inputs.pin')}
        value={pinField.value}
        onFilled={pinField.onFilled}
        onBlur={pinField.onBlur}
        errorMessage={pinField.error}
        allowVisibility
      />

      <GenericButton
        type="submit"
        className="generic-button"
        text={t('common.buttons.ok')}
        aria-label={t('common.aria.buttons.ok')}
        disabled={!formFilled}
      />
      </form>
    </main>
  );
};

export default LogInPlayerPage;