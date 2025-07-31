// pages/User/UserChangePassword.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formFilled =
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmPassword.trim() !== '';

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <h3 className="font-semibold text-center">Change password</h3>

      <GenericInput
        type="password"
        value={currentPassword}
        placeholder="Current password"
        onFilled={setCurrentPassword}
      />
      <GenericInput
        type="password"
        value={newPassword}
        placeholder="New password"
        onFilled={setNewPassword}
      />
      <GenericInput
        type="password"
        value={confirmPassword}
        placeholder="Confirm new password"
        onFilled={setConfirmPassword}
      />

      <GenericButton
        className="generic-button"
        text="SAVE"
        disabled={!formFilled}
        onClick={() => {
            alert('Password updated');
            navigate('/settings'); // or navigate(-1)
        }}
      />
    </div>
  );
};

export default ChangePasswordPage;