// /src/pages/Auth/Verify2fa.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { GenericButton } from '../../components/GenericButton';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import { useUserContext } from '../../context/UserContext';
import { verify2FA } from '../../utils/Fetch';

const Verify2faPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [code, setCode] = useState('');
  const formFilled = /^\d{6}$/.test(code);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = user?.accessToken;

  // Verify 6-digit TOTP code
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!accessToken) {
      alert(t("common.errors.unauthorized"));
      navigate("/signin");
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await verify2FA(code, accessToken);
  
    // /2fa/verfication
    

    setIsVerifying(false);

    if (result?.verified) {
      navigate(`/user/${user?.username}`);
    } else {
      setError(t('pages.twoFactorAuth.setup.invalidCode'));
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

      <form onSubmit={handleVerify} className="flex flex-col">
        <VerificationCodeInput
          onComplete={setCode}
          aria-label={t('pages.twoFactorAuth.verify.aria.codeInput')}
        />

        {isVerifying &&
          <p>{t('pages.twoFactorAuth.verify.checking')}</p>}

        {error &&
          <p className="text-red-600">
            {error}
          </p>}

        <div className="flex justify-center mt-6">
          <GenericButton
            type="submit"
            className="generic-button"
            text={t('common.buttons.verify')}
            disabled={!formFilled || isVerifying}
            // onClick={handleVerify}
          />
        </div>
        </form>

        <p className="text-sm mt-6">
          {t('pages.twoFactorAuth.verify.backupPrompt')}{' '}
          <Link
            to="/verify2fa/recovery"
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
