// /src/pages/SignIn.tsx

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CustomGoogleLoginButton from "../components/CustomGoogleLoginButton";
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";
import { useValidationField } from '../hooks/useValidationField';
import { isValidUsername, isValidEmail, isValidPassword } from '../utils/Validation';

const clientId = "604876395020-v57ifnl042bi718lgm2lckhpbfqdog6b.apps.googleusercontent.com";

const SignInPage: React.FC = () => {
  const { t } = useTranslation();  
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername);
  const passwordField = useValidationField('', isValidPassword);

  const formFilled =
    usernameField.value !== '' &&
    passwordField.value !== '';

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
          onClick={() => navigate('/homeuser')}
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