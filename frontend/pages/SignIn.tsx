// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';

interface UserProfile {
  indentifier: string,
  password: string
}

const signInUser = async (player: UserProfile): Promise<UserProfile | null> => {
  console.log('Sending user:', player);
  try {
    const response = await fetch('http://localhost:8443/as/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(player)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } 
  
  catch (error) {
    console.error('Error:', error);
    return null;
  }
}


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
        onClick={async () => {
          const newUser: UserProfile = {
            indentifier: usernameField.value,
            password: passwordField.value,
          };
          const signIn = await signInUser(newUser);
          if (signIn) {
            alert('Signed in successfully!');
            navigate('/homeuser');
          }
          else
            alert('Sign in failed. Please try again.'); // what went wrong? 
        }}
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
