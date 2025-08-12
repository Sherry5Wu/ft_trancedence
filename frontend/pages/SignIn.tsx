// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';

interface UserProfile {
  indentifier: string,
  password: string
}

const signInUser = async (player: UserProfile) => {
    console.log(player);
    try {
      const response = await fetch('http://localhost:8443/as/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(player)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data;

    //   const userID = data.user.id;

    //   const statResponse = await fetch (`http://localhost:8443/stats/user_match_data/${userID}`, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
      
    //   if (!statResponse.ok) {
    //     throw new Error(`HTTP error! Status: ${statResponse.status}`);
    //   }
      
    //   const stats = await statResponse.json();
    //   return {data, stats};
    }

    catch (error) {
      console.error('Error:', error);
      return null;
    }
} 

const SignInPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUserContext();

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
          const signInData = await signInUser(newUser);
          if (signInData) {
            alert('Signed in successfully!');
            setUser({
              username: signInData.user.username,
              id: signInData.user.id,
              email: signInData.user.email,
              profilePic: signInData.user.profilepic,
              score: 0,
              rank: 0,
              accessToken: signInData.accessToken,
              refreshToken: signInData.refreshToken,
            });
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
