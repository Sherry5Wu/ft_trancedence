// pages/User/UserChangePIN.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { CloseButton } from '../../components/CloseButton';
import { useValidationField } from '../../utils/Hooks';
import { isValidPin } from '../../utils/Validation';
import { useUserContext } from '../../context/UserContext';
import { updateUserPin } from "../../utils/Fetch";

const ChangePINPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFilled) return;

    const accessToken = user?.accessToken;
    if (!accessToken) {
      alert(t("common.errors.unauthorized"));
      navigate("/signin");
      return;
    }

    const success = await updateUserPin(
      currentPinField.value,
      newPinField.value,
      accessToken
    );

    if (success) {
      alert(t("common.alerts.success"));
      navigate("/settings");
    } else {
      alert(t("common.errors.incorrectPIN"));
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
      text={t('pages.changePIN.aria.description')}
    />

    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <CloseButton
        className="ml-auto"
        aria-label={t('common.aria.buttons.cancel')}
        onClick={() => navigate('/settings')}
      />

      <h2 id="pageTitle" className="font-semibold text-center">
        {t('pages.changePIN.title')}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col">
      <GenericInput
        type="password"
        placeholder={t('common.placeholders.pin')}
        aria-label={t('common.aria.inputs.pin')}
        value={currentPinField.value}
        onFilled={currentPinField.onFilled}
        onBlur={currentPinField.onBlur}
        errorMessage={currentPinField.error}
        allowVisibility
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
        allowVisibility
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePIN.confirmNewPIN')}
        aria-label={t('pages.changePIN.aria.confirmNewPIN')}
        value={confirmNewPin}
        onFilled={setConfirmNewPin}
        errorMessage={pinMismatch ? t('common.errors.pinMismatch') : ''}
        allowVisibility
      />

      <GenericButton
        type="submit"
        className="generic-button"
        text={t('common.buttons.save')}
        aria-label={t('common.aria.buttons.save')}
        disabled={!formFilled}
      />
      </form>
      </div>
    </main>
  );
};

export default ChangePINPage;