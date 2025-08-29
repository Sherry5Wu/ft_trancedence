// /src/pages/Auth/Verify2fa.tsx

import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { GenericButton } from '../../components/GenericButton';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import { useUserContext } from '../../context/UserContext';
import { verifyCode2FA } from '../../utils/Fetch';
import { DEFAULT_AVATAR } from '../../utils/constants';

const Verify2faPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser, setTokenReceived } = useUserContext();

  const [code, setCode] = useState('');
  const formFilled = /^\d{6}$/.test(code);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const routeState = location.state as { userId?: string } | undefined;

  // store user id via Router state, fallback to sessionStorage
  const userId = routeState?.userId || sessionStorage.getItem("pending2FAUserId");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!userId) {
      alert(t("common.errors.unauthorized"));
      navigate("/signin");
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await verifyCode2FA(userId, code);

    setIsVerifying(false);

    switch (result.type) {

      case 'INVALID_CODE':
        setError(t('pages.twoFactorAuth.setup.invalidCode'));
        break;

      case 'SUCCESS':
        sessionStorage.removeItem("pending2FAUserId");

        const { accessToken, user } = result.data;

        setTokenReceived(true);
        setUser({
          username: user.username,
          id: user.id,
          profilePic: user.avatarUrl || DEFAULT_AVATAR,
          score: 0,
          rank: 0,
          rivals: [],
          accessToken,
          expiry: Date.now() + 15 * 60 * 1000,
          twoFA: user.TwoFAStatus,
          googleUser: user.registerFromGoogle,
        });

        navigate(`/user/${user.username}`);
        break;

      case 'UNAUTHORIZED':
        alert(t('common.errors.unauthorized'));
        navigate('/signin');
        break;

      default:
        setError('error');  
      //setError(t('common.alerts.failure.signIn'));
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
