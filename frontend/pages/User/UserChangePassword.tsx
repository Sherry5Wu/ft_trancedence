// pages/User/UserChangePassword.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidPassword } from '../../utils/Validation';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const passwordField = useValidationField('', isValidPassword);
  const newPasswordField = useValidationField('', isValidPassword);

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
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <h3 className="font-semibold text-center">Change password</h3>

      <GenericInput
        type="password"
        placeholder="Password"
        value={passwordField.value}
        onFilled={passwordField.onFilled}
        onBlur={passwordField.onBlur}
        errorMessage={passwordField.error}
      />

      <GenericInput
        type="password"
        placeholder="New password"
        value={newPasswordField.value}
        onFilled={newPasswordField.onFilled}
        onBlur={newPasswordField.onBlur}
        errorMessage={
          newPasswordField.error ||
          (newPasswordIsSame ? 'New password must be different from current password' : '')
        }
      />

      <GenericInput
        type="password"
        placeholder="Confirm new password"
        value={confirmNewPassword}
        onFilled={setConfirmNewPassword}
        errorMessage={passwordMismatch ? "New passwords do not match" : ''}
      />

      <GenericButton
        className="generic-button"
        text="SAVE"
        disabled={!formFilled}
        onClick={() => {
            alert('Password updated');
            navigate('/settings');
        }}
      />
    </div>
  );
};

export default ChangePasswordPage;