// /src/pages/Auth/Verify2fa.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { GenericButton } from '../../components/GenericButton';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import { useUserContext } from '../../context/UserContext';

const Verify2faPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeComplete = async (enteredCode: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('https://localhost:8443/as/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: enteredCode }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setIsValid(true);
      } else {
        setIsValid(false);
        setError(t('pages.twoFactorAuth.verify.invalidCode'));
      }
    } catch (err) {
      console.error(err);
      setIsValid(false);
      setError(t('pages.twoFactorAuth.verify.errorMessage'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyClick = () => {
    navigate(`/user/${user?.username}`);
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
        text={t('pages.twoFactorAuth.verify.aria.description')}
      />

      <div className="max-w-md mx-auto space-y-6 text-center">
        <h1 id="pageTitle" className="text-2xl font-bold">
          {t('pages.twoFactorAuth.verify.title')}
        </h1>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verify.subtitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.verify.instructions')}
        </p>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verify.verifyCodeTitle')}
        </h2>

        <VerificationCodeInput
          onComplete={handleCodeComplete}
          aria-label={t('pages.twoFactorAuth.verify.aria.codeInput')}
          // Error handling: If user input fails validation, ensure accessible error messages
          // are displayed and linked with aria-describedby or aria-invalid attributes.
        />

        {isVerifying &&
          <p>
            {t('pages.twoFactorAuth.verify.checking')}
          </p>}

        {error &&
          <p className="text-red-600">
            {error}
          </p>}

        <div className="flex justify-center mt-6">
          <GenericButton
            className="generic-button"
            text={t('common.buttons.verify')}
            disabled={!isValid || isVerifying}
            onClick={handleVerifyClick}
          />
        </div>

        <p className="text-sm mt-6">
          {t('pages.twoFactorAuth.verify.backupPrompt')}{' '}
          <Link
            to="/404"
            className="underline"
            aria-label={t('pages.twoFactorAuth.verify.aria.backupLink')}
          >
            {t('pages.twoFactorAuth.verify.backupLink')}
          </Link>
        </p>

      </div>
    </main>
  );
};

export default Verify2faPage;
