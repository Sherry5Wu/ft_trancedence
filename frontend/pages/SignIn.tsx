// /src/pages/SignIn.tsx

import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CustomGoogleLoginButton from "../components/CustomGoogleLoginButton";
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';

const clientId = "604876395020-v57ifnl042bi718lgm2lckhpbfqdog6b.apps.googleusercontent.com";

interface UserProfile {
  indentifier: string,
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

const SignInPage: React.FC = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const passwordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));

  const formFilled =
    usernameField.value !== '' &&
    passwordField.value !== '' &&
    !usernameField.error &&
    !passwordField.error;;

  useEffect(() => {
    const handlePopupMessage = (event) => {
      // Ensure the message is coming from the correct origin
      if (event.origin === 'https://accounts.google.com') {
        if (event.data === 'googleLoginSuccess') {
          console.log('User logged in successfully');
          // You can navigate the user or update state
          navigate('/homeuser');
        } else if (event.data === 'googleLoginFailed') {
          console.error('Login failed');
        }
      }
    };
    window.addEventListener('message', handlePopupMessage);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
    };
  }, [navigate]);

return (
    <GoogleOAuthProvider clientId={clientId}>
      <main
        className="pageLayout"
        role="main"
        aria-labelledby="pageTitle"
        aria-describedby="pageDescription"
      >
        <AccessiblePageDescription
          id="pageDescription"
          text={t('pages.signIn.aria.description')}
        />

        <h1 id="pageTitle" className="font-semibold text-center text-xl">
          {t('pages.signIn.title')}
        </h1>

        <GenericInput
          type="text"
          placeholder={t('common.placeholders.username')}
          aria-label={t('common.aria.inputs.username')}
          value={usernameField.value}
          onFilled={usernameField.onFilled}
          onBlur={usernameField.onBlur}
          errorMessage={usernameField.error}
        />

        <GenericInput
          type="password"
          placeholder={t('common.placeholders.password')}
          aria-label={t('common.aria.inputs.password')}
          value={passwordField.value}
          onFilled={passwordField.onFilled}
          onBlur={passwordField.onBlur}
          errorMessage={passwordField.error}
        />

        <GenericButton
          className="generic-button"
          text={t('common.buttons.logIn')}
          aria-label={t('common.aria.buttons.logIn')}
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
                username: signInData.data.user.username,
                id: signInData.data.user.id,
                email: signInData.data.user.email,
                profilePic: signInData.data.user.profilepic || <img src='../assets/noun-profile-7808629.svg' className='profilePic w-full h-full border-2' />,
                score: signInData.stats.score,
                rank: signInData.stats.score,
                rivals: signInData.rivals,
                accessToken: signInData.data.accessToken,
                refreshToken: signInData.data.refreshToken,
              });
              navigate(`/user/${usernameField.value}`)
            }
            else
              alert('Sign in failed. Please try again.');
        }}
      />

        {/* Google Sign-In */}
        <CustomGoogleLoginButton
          aria-label={t('pages.signInWithGoogle.aria.signInWithGoogle')}
        />

        <p className="text-center text-sm">
          {t('pages.signIn.links.notRegistered')}{' '}
          <Link
            to="/signup"
            className="underline"
            aria-label={t('pages.signIn.aria.signUpLink')}
          >
            {t('pages.signIn.links.signUp')}
          </Link>
        </p>
      </main>
    </GoogleOAuthProvider>
  );
};

export default SignInPage;