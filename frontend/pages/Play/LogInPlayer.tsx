// pages/Play/LogInPlayer.tsx
// registered user logs in with username and player PIN as a 2nd player
// game data will be stored on database

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput} from "../../components/GenericInput";
import { useValidationField } from '../../hooks/useValidationField';
import { isValidUsername, isValidPin } from '../../utils/Validation';

const LogInPlayerPage: React.FC = () => {
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername);
  const pinField = useValidationField('', isValidPin);

  const formFilled =
    usernameField.value !== '' &&
    pinField.value !== '';

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>

      <h3 className="font-semibold text-center">Log in a player</h3>

      <GenericInput
        type="username"
        placeholder="Username"
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameField.error}
      />

      <GenericInput
        type="password"
        placeholder="Player PIN"
        value={pinField.value}
        onFilled={pinField.onFilled}
        onBlur={pinField.onBlur}
        errorMessage={pinField.error}
      />

      {/* OK Button */}
      <GenericButton
        className="generic-button"
        text="OK"
        disabled={!formFilled}
        onClick={() => { navigate(-1);}} //  go to the previous page in React Router without explicitly defining the path
      />
      </div>
    </div>
  );
};

export default LogInPlayerPage;
