// /src/pages/SignIn.tsx

import React from 'react';
import CustomGoogleLoginButton from "../components/CustomGoogleLoginButton";
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../utils/Hooks';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';
import { LoginData } from '../utils/Interfaces';
import { signInUser } from '../utils/Fetch';
import { DEFAULT_AVATAR } from '../utils/constants';

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
    !passwordField.error;

return (
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

      <div className="flex flex-col justify-center p-8 w-[270px]">
        <h2 id="pageTitle" className="font-semibold text-center">
          {t('pages.signIn.title')}
        </h2>

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
          allowVisibility
        />

        <GenericButton
          className="generic-button m-1 -translate-y-1"
          text={t('common.buttons.logIn')}
          aria-label={t('common.aria.buttons.logIn')}
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
                profilePic: signInData.data.user.avatarUrl || DEFAULT_AVATAR,
                score: signInData.stats.score,
                rank: signInData.stats.score,
                rivals: signInData.rivals,
                accessToken: signInData.data.accessToken,
                // refreshToken: signInData.data.refreshToken,
                expiry: Date.now() + 15 * 60 * 1000,
                twoFA: signInData.data.twoFA,
              });
              navigate(`/user/${usernameField.value}`)
            }
            else
              alert('Sign in failed. Please check your username and password, and try again.');
        }}
      />

        {/* Google Sign-In */}
        <CustomGoogleLoginButton
          aria-label={t('pages.signInWithGoogle.aria.signInWithGoogle')}
        />

        <p className="text-center text-sm translate-y-3">
          {t('pages.signIn.links.notRegistered')}{' '}
          <Link
            to="/signup"
            className="underline hover:bg-black hover:text-white rounded-xl px-1 py-0.5 hover:no-underline"
            aria-label={t('pages.signIn.aria.signUpLink')}
          >
            {t('pages.signIn.links.signUp')}
          </Link>
        </p>
        </div>
      </main>
  );
};

export default SignInPage;