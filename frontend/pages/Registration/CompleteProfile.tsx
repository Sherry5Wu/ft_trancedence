// /src/pages/CompleteProfile.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { ToggleButton } from '../../components/ToggleButton';
import { useValidationField } from '../../utils/Hooks';
import { isValidUsername, isValidPin } from '../../utils/Validation';


// async function createUser(player: Omit<Player, 'player_id'>): Promise<Player | null> {
//   try {
//     const response = await fetch('http://localhost:9000/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(player)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
    
//     return await response.json();
//   } 
  
//   catch (error) {
//     console.error('Error:', error);
//     return null;
//   }
// }

const CompleteProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const pinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));

  const [confirmPin, setConfirmPin] = useState('');

  const pinMismatch =
    pinField.value &&
    confirmPin &&
    pinField.value !== confirmPin;

  const formFilled =
    usernameField.value !== '' &&
    pinField.value !== '' &&
    confirmPin !== '' &&
    !usernameField.error &&
    !pinField.error &&
    !pinMismatch;

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.completeProfile.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.completeProfile.title')}
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

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.confirmPin')}
        aria-label={t('common.aria.inputs.confirmPin')}
        value={confirmPin}
        onFilled={setConfirmPin}
        errorMessage={pinMismatch ? t('common.errors.pinMismatch') : ''}
      />

      <ToggleButton
        label={t('pages.completeProfile.toggle2FA')}
        aria-label={t('pages.completeProfile.aria.toggle2FA')}
        onClick={() => navigate('/setup2fa')}
      />

      <GenericButton
        className="generic-button"
        text={t('common.buttons.save')}
        aria-label={t('common.aria.buttons.save')}
        disabled={!formFilled}
        onClick={() => {
          alert(t('common.alerts.something')); // Temporary success message
          navigate('/user/:username');
        }}
      />
    </main>
  );
};

export default CompleteProfilePage;

