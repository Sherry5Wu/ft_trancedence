// pages/SignUp.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { GenericInput } from '../components/GenericInput';
import { ToggleButton } from '../components/ToggleButton';
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword, isValidPin } from '../utils/Validation';


// const createUser = async (player: Omit<Player, 'player_id'>): Promise<Player | null> {
//   try {
//     const response = await fetch('http://localhost:9000', {
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

interface UserProfile {
  username: string;
  email: string;
  password: string;
  pincode: string;
}

const SignUpPage = () => {
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername);
  const emailField = useValidationField('', isValidEmail);
  const passwordField = useValidationField('', isValidPassword);
  const pinField = useValidationField('', isValidPin);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const passwordMismatch =
    passwordField.value &&
    confirmPassword &&
    passwordField.value !== confirmPassword;

  const pinMismatch =
    pinField.value &&
    confirmPin &&
    pinField.value !== confirmPin;

  const formFilled =
    usernameField.value !== '' &&
    emailField.value !== '' &&
    passwordField.value !== '' &&
    confirmPassword !== '' &&
    pinField.value !== '' &&
    confirmPin !== '' &&
    !usernameField.error &&
    !emailField.error &&
    !passwordField.error &&
    !pinField.error &&
    !passwordMismatch &&
    !pinMismatch;

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      <h3 className="font-semibold text-center">Sign Up</h3>

      <GenericInput
        type="username"
        placeholder="Username"
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameField.error}
      />

      <GenericInput
        type="email"
        placeholder="Email"
        value={emailField.value}
        onFilled={emailField.onFilled}
        onBlur={emailField.onBlur}
        errorMessage={emailField.error}
      />

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
        placeholder="Confirm Password"
        value={confirmPassword}
        onFilled={setConfirmPassword}
        errorMessage={passwordMismatch ? "Passwords do not match" : ''}
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
        text="SIGN UP"
        disabled={!formFilled}
        onClick={() => {
          // const newUser: UserProfile = {
          //   username: usernameField.value,
          //   email: emailField.value,
          //   password: passwordField.value,
          //   pincode: pinField.value
          // };
          // const registration = await createUser(newUser);
          // if (registration) {
          //   alert('Registered successfully!');
          //   navigate('/homeuser');
          // }
          // else
          //   alert('Registration failed. Please try again.'); // what went wrong? 
        }}
      />

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;

