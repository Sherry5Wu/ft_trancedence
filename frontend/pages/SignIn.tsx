// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../utils/Hooks';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';
<<<<<<< HEAD

interface UserProfile {
  identifier: string,
  password: string
}

const signInUser = async (player: UserProfile) => {
    console.log(player);
    try {
      const response = await fetch('https://localhost:8443/as/auth/login', {
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

      const userID = data.user.id;
      console.log(userID);

      const statResponse = await fetch (`https://localhost:8443/stats/user_match_data/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!statResponse.ok) {
        throw new Error(`HTTP error! Status: ${statResponse.status}`);
      }

      const stats = await statResponse.json();

      const rivalResponse = await fetch (`https://localhost:8443/stats/rivals/${data.user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!rivalResponse.ok) {
        throw new Error(`HTTP error! Status: ${rivalResponse.status}`);
      }

      const rivals = await rivalResponse.json();

      return {data, stats, rivals};
    }

    catch (error) {
      console.error('Error:', error);
      return null;
    }
}
=======
import { LoginData } from '../utils/Interfaces';
import { signInUser } from '../utils/Fetch';
>>>>>>> 38b82bfe01507b2eca8e796e455dac3d0f511450

const SignInPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  const usernameField = useValidationField('', isValidUsername);
  const passwordField = useValidationField('', isValidPassword);

  const formFilled =
    usernameField.value !== '' &&
    passwordField.value !== '';

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">

      <h3 className="font-semibold text-center">Sign In</h3>

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
<<<<<<< HEAD
          const newUser: UserProfile = {
=======
          const newUser: LoginData = {
>>>>>>> 38b82bfe01507b2eca8e796e455dac3d0f511450
            identifier: usernameField.value,
            password: passwordField.value,
          };
          const signInData = await signInUser(newUser);
          if (signInData) {
            alert('Signed in successfully!');
            setUser({
              username: signInData.data.user.username,
              id: signInData.data.user.id,
              email: signInData.data.user.email,
              profilePic: signInData.data.user.profilepic || <img src='../assets/noun-profile-7808629.svg' className='profilePic' />,
              score: signInData.stats.score,
              rank: signInData.stats.score,
              rivals: signInData.rivals,
              accessToken: signInData.data.accessToken,
              refreshToken: signInData.data.refreshToken,
            });
            navigate(`/user/${usernameField.value}`)
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
