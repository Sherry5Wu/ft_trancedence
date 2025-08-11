// pages/CompleteProfile.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { ToggleButton } from '../../components/ToggleButton';
import { useValidationField } from '../../hooks/useValidationField';
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
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername);
  const pinField = useValidationField('', isValidPin);

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
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <h3 className="font-semibold text-center">Complete user registration</h3>

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

      <GenericInput
        type="password"
        placeholder="Confirm Player PIN"
        value={confirmPin}
        onFilled={setConfirmPin}
        errorMessage={pinMismatch ? "PINs do not match" : ''}
      />

      <ToggleButton
        label="2FA with Google Authenticator"
        onClick={() => navigate('/setup2fa')}
      />

      <GenericButton
        className="generic-button"
        text="SAVE"
        disabled={!formFilled}
        onClick={() => {
          alert('Registered successfully!');
          // createUser();
          navigate('/homeuser');
        }}
      />

    </div>
  );
};

export default CompleteProfilePage;

