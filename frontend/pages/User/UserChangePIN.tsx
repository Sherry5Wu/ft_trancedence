// pages/User/UserChangePIN.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { CloseButton } from '../../components/CloseButton';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidPin } from '../../utils/Validation';

const ChangePINPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentPinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));
  const newPinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));

  const [confirmNewPin, setConfirmNewPin] = useState('');

  const pinMismatch =
    newPinField.value &&
    confirmNewPin &&
    newPinField.value !== confirmNewPin;

  const newPinIsSame =
    currentPinField.value !== '' &&
    newPinField.value !== '' &&
    currentPinField.value === newPinField.value;

  const formFilled =
    currentPinField.value !== '' &&
    newPinField.value !== '' &&
    confirmNewPin !== '' &&
    !currentPinField.error &&
    !newPinField.error &&
    !pinMismatch &&
    !newPinIsSame;

  return (
    <main
      className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <h1 id="pageTitle" className="sr-only">
        {t('pages.changePIN.aria.label')}
      </h1>

      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.changePIN.aria.description')}
      />

      <CloseButton
        className="ml-auto"
        aria-label={t('common.aria.buttons.cancel')}
        onClick={() => navigate('/settings')}
      />

      <h2 className="font-semibold text-center">
        {t('pages.changePIN.title')}
      </h2>

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.pin')}
        aria-label={t('common.aria.inputs.pin')}
        value={currentPinField.value}
        onFilled={currentPinField.onFilled}
        onBlur={currentPinField.onBlur}
        errorMessage={currentPinField.error}
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePIN.newPIN')}
        aria-label={t('pages.changePIN.aria.PIN')}
        value={newPinField.value}
        onFilled={newPinField.onFilled}
        onBlur={newPinField.onBlur}
        errorMessage={
          newPinField.error ||
          (newPinIsSame ? t('common.errors.newSameAsOldPIN') : '')
        }
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePIN.confirmNewPIN')}
        aria-label={t('pages.changePIN.aria.confirmNewPIN')}
        value={confirmNewPin}
        onFilled={setConfirmNewPin}
        errorMessage={pinMismatch ? t('common.errors.pinMismatch') : ''}
      />

      <GenericButton
        className="generic-button"
        text={t('common.buttons.save')}
        aria-label={t('common.aria.buttons.save')}
        disabled={!formFilled}
        onClick={() => {
          alert(t('common.alerts.success'));
          navigate('/settings');
        }}
      />
    </main>
  );
};

export default ChangePINPage;