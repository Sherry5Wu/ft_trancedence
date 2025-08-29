import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { GenericButton } from '../../components/GenericButton';
import { useUserContext } from '../../context/UserContext';
import { verifyBackupCode } from '../../utils/Fetch';
import { GenericInput } from '../../components/GenericInput';
import { DEFAULT_AVATAR } from '../../utils/constants';

const Verify2faBackupCodePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser, setTokenReceived } = useUserContext();

  const [code, setCode] = useState('');
  const formFilled = code.trim().length > 0;
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

    const result = await verifyBackupCode(userId, code);

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
        setError(t('common.alerts.failure.signIn'));
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
        text={t('pages.twoFactorAuth.verifyBackupCode.aria.description')}
      />

      <div className="max-w-md mx-auto space-y-6 text-center">
        <h1 id="pageTitle" className="text-2xl font-bold">
          {t('pages.twoFactorAuth.verifyBackupCode.title')}
        </h1>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verifyBackupCode.subtitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.verifyBackupCode.instructions')}
        </p>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verifyBackupCode.verifyCodeTitle')}
        </h2>

        <form onSubmit={handleVerify} className="flex flex-col">
            <GenericInput
                type="text"
                placeholder={t('pages.twoFactorAuth.verifyBackupCode.placeholder')}
                aria-label={t('pages.twoFactorAuth.verifyBackupCode.aria.codeInput')}
                value={code}
                onFilled={(val: string) => {
                    setCode(val);
                    if (error) setError(null);
                }}
                onFocus={() => {
                    if (error) setError(null);
                }}
                //   errorMessage={error || undefined}
            />

          {isVerifying &&
            <p>{t('pages.twoFactorAuth.verify.checking')}</p>}

          {error &&
            <p className="text-red-600">{error}</p>}

          <div className="flex justify-center mt-6">
            <GenericButton
              type="submit"
              className="generic-button"
              text={t('common.buttons.verify')}
              disabled={!formFilled || isVerifying}
            />
          </div>
        </form>

      </div>
    </main>
  );
};

export default Verify2faBackupCodePage;
