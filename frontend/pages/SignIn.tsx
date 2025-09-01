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
import { isValidUsername, isValidPassword } from '../utils/Validation';
import { LoginData } from '../utils/Interfaces';
import { signInUser } from '../utils/Fetch';
import { DEFAULT_AVATAR } from '../utils/constants';

const SignInPage: React.FC = () => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const { user, setUser, setTokenReceived } = useUserContext();

  // const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const passwordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));
  const identifierField = useValidationField('', () => true, '');

  const formFilled =
    identifierField.value !== '' &&
    passwordField.value !== '' &&
    !identifierField.error &&
    !passwordField.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent full page reload

    if (!formFilled) return;

    const newUser: LoginData = {
      identifier: identifierField.value,
      password: passwordField.value,
    };

    const signInData = await signInUser(newUser);

    switch (signInData.type) {

      // 1: Wrong password
      case 'PASSWORD_NOT_MATCH':
        alert(t('common.alerts.failure.signIn'));
        break;

		  // 2: 2FA required
      case '2FA_REQUIRED':
        sessionStorage.setItem("pending2FAUserId", signInData.userId);
        navigate('/verify2fa', { state: { userId: signInData.userId }});
        break;

		  // 3: Password matched + 2FA disabled
      case 'LOGIN_SUCCESS':
        setTokenReceived(true);

        const { data, stats, rivals } = signInData;
        setUser({
          username: data.user.username,
          id: data.user.id,
          profilePic: data.user.avatarUrl || DEFAULT_AVATAR,
          score: stats.score,
          rank: stats.score,
          rivals,
          accessToken: data.accessToken,
          expiry: Date.now() + 15 * 60 * 1000,
          twoFA: data.user.TwoFAStatus,
          googleUser: data.user.registerFromGoogle,
        });

        navigate(`/user/${data.user.username}`);
        break;

      default:
        alert(t('common.alerts.failure.signIn'));
    }
  };

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

        <form onSubmit={handleSubmit} className="flex flex-col">
          <GenericInput
            type="text"
            placeholder={t('common.placeholders.username')}
            aria-label={t('common.aria.inputs.username')}
            value={identifierField.value}
            onFilled={identifierField.onFilled}
            onBlur={identifierField.onBlur}
            errorMessage={identifierField.error}
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
            type="submit"
          />
        </form>

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