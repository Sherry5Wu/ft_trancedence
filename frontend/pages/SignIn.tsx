// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../utils/Hooks';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';
import { LoginData } from '../utils/Interfaces';
import { signInUser } from '../utils/Fetch';

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
          const newUser: LoginData = {
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
