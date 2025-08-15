// /src/pages/User/UserChangePassword.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { CloseButton } from '../../components/CloseButton';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidPassword } from '../../utils/Validation';

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const passwordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));
  const newPasswordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));

  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const newPasswordIsSame =
    passwordField.value !== '' &&
    newPasswordField.value !== '' &&
    passwordField.value === newPasswordField.value;

  const passwordMismatch =
    newPasswordField.value &&
    confirmNewPassword &&
    newPasswordField.value !== confirmNewPassword;

  const formFilled =
    passwordField.value !== '' &&
    newPasswordField.value !== '' &&
    confirmNewPassword !== '' &&
    !passwordField.error &&
    !newPasswordField.error &&
    !passwordMismatch &&
    !newPasswordIsSame;

    
  return (
    <main
      className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >

      <h1 id="pageTitle" className="sr-only">
        {t('pages.changePassword.aria.label')}
      </h1>

      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.changePassword.aria.description')}
      />

      <CloseButton
        className="ml-auto"
        aria-label={t('common.aria.buttons.cancel')}
        onClick={() => navigate('/settings')}
      />

      <h2 className="font-semibold text-center">
        {t('pages.changePassword.title')}
      </h2>

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.password')}
        aria-label={t('common.aria.inputs.password')}
        value={passwordField.value}
        onFilled={passwordField.onFilled}
        onBlur={passwordField.onBlur}
        errorMessage={passwordField.error}
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePassword.newPassword')}
        aria-label={t('pages.changePassword.aria.newPassword')}
        value={newPasswordField.value}
        onFilled={newPasswordField.onFilled}
        onBlur={newPasswordField.onBlur}
        errorMessage={
          newPasswordField.error ||
          (newPasswordIsSame ? t('common.errors.newSameAsOldPassword') : '')
        }
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePassword.confirmNewPassword')}
        aria-label={t('pages.changePassword.aria.confirmNewPassword')}
        value={confirmNewPassword}
        onFilled={setConfirmNewPassword}
        errorMessage={passwordMismatch ? t('common.errors.passwordMismatch') : ''}
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

export default ChangePasswordPage;