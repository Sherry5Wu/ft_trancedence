// /src/pages/User/UserChangePassword.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { CloseButton } from '../../components/CloseButton';
import { useValidationField } from '../../utils/Hooks';
import { isValidPassword } from '../../utils/Validation';
import { useUserContext } from '../../context/UserContext';
import { updateUserPassword } from '../../utils/Fetch';

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const currentPasswordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));
  const newPasswordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));

  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const newPasswordIsSame =
    currentPasswordField.value !== '' &&
    newPasswordField.value !== '' &&
    currentPasswordField.value === newPasswordField.value;

  const passwordMismatch =
    newPasswordField.value &&
    confirmNewPassword &&
    newPasswordField.value !== confirmNewPassword;

  const formFilled =
    currentPasswordField.value !== '' &&
    newPasswordField.value !== '' &&
    confirmNewPassword !== '' &&
    !currentPasswordField.error &&
    !newPasswordField.error &&
    !passwordMismatch &&
    !newPasswordIsSame;

    
  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
    <AccessiblePageDescription
      id="pageDescription"
      text={t('pages.changePassword.aria.description')}
    />

    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <CloseButton
        className="ml-auto"
        aria-label={t('common.aria.buttons.cancel')}
        onClick={() => navigate('/settings')}
      />

      <h2 id="pageTitle" className="font-semibold text-center">
        {t('pages.changePassword.title')}
      </h2>

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.password')}
        aria-label={t('common.aria.inputs.password')}
        value={currentPasswordField.value}
        onFilled={currentPasswordField.onFilled}
        onBlur={currentPasswordField.onBlur}
        errorMessage={currentPasswordField.error}
        allowVisibility
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
        allowVisibility
      />

      <GenericInput
        type="password"
        placeholder={t('pages.changePassword.confirmNewPassword')}
        aria-label={t('pages.changePassword.aria.confirmNewPassword')}
        value={confirmNewPassword}
        onFilled={setConfirmNewPassword}
        errorMessage={passwordMismatch ? t('common.errors.passwordMismatch') : ''}
        allowVisibility
      />

      <GenericButton
        className="generic-button"
        text={t('common.buttons.save')}
        aria-label={t('common.aria.buttons.save')}
        disabled={!formFilled}
        onClick={async () => {
          const accessToken = user?.accessToken
          if (!accessToken) {
            alert(t("common.errors.unauthorized"));
            navigate("/signin");
            return;
          }

          const success = await updateUserPassword(
            currentPasswordField.value,
            newPasswordField.value, 
            accessToken
          );

          if (success) {
            alert(t("common.alerts.success"));
            navigate("/settings");
          } else {
            alert(t("common.errors.incorrectPassword"));
          }
        }}
      />
      </div>
    </main>
  );
};

export default ChangePasswordPage;