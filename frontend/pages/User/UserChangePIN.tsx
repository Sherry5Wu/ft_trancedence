// pages/User/UserChangePIN.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { CloseButton } from '../../components/CloseButton';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidPin } from '../../utils/Validation';

const ChangePINPage: React.FC = () => {
  const navigate = useNavigate();

  const currentPinField = useValidationField('', isValidPin);
  const newPinField = useValidationField('', isValidPin);

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
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <CloseButton className="ml-auto" />

      <h3 className="font-semibold text-center">Change PIN</h3>

      <GenericInput
        type="password"
        placeholder="Current PIN code"
        value={currentPinField.value}
        onFilled={currentPinField.onFilled}
        onBlur={currentPinField.onBlur}
        errorMessage={currentPinField.error}
      />

      <GenericInput
        type="password"
        placeholder="New PIN code"
        value={newPinField.value}
        onFilled={newPinField.onFilled}
        onBlur={newPinField.onBlur}
        errorMessage={
          newPinField.error ||
          (newPinIsSame ? 'New PIN must be different from current PIN code' : '')
        }
      />

      <GenericInput
        type="password"
        placeholder="Confirm new PIN code"
        value={confirmNewPin}
        onFilled={setConfirmNewPin}
        errorMessage={pinMismatch ? 'PIN codes do not match' : ''}
      />

      <GenericButton
        className="generic-button"
        text="SAVE"
        disabled={!formFilled}
        onClick={() => {
          alert('PIN code updated');
          navigate('/settings');
        }}
      />
    </div>
  );
};

export default ChangePINPage;