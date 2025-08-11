// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';

const fetchUserData = async (userID: string | undefined): Promise<userData | null> => {
    try {
        const response = await fetch(`http://localhost:8443/as/auth/${userID}`);

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        const userData: userData = await response.json();
            return userData;
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername);
  const passwordField = useValidationField('', isValidPassword);

  const formFilled =
    usernameField.value !== '' &&
    passwordField.value !== '';

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      
      <h3 className="font-semibold text-center">Sing In</h3>

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
        placeholder="Password"
        value={passwordField.value}
        onFilled={passwordField.onFilled}
        onBlur={passwordField.onBlur}
        errorMessage={passwordField.error}
      />

      <GenericButton
        className="generic-button"
        text="LOG IN"
        disabled={!formFilled}
        onClick={() => { navigate('/homeuser')}}
      />

      {/* GoogleLogin Button */}

      {/* Sign up link */}
      <p className="text-center text-sm">
        Not registered?{' '}
        <Link to="/signup" className="text: underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
