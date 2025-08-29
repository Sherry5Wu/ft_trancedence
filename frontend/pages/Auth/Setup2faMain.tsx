// /src/pages/Auth/Setup2faMain.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import { useUserContext } from '../../context/UserContext';
import { confirm2FA } from '../../utils/Fetch';
import { fetchProfileMe, disable2FA } from '../../utils/Fetch';
import { ProfileMeResponse } from '../../utils/Interfaces';

const Setup2faMainPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [code, setCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [setupKey, setSetupKey] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formFilled = /^\d{6}$/.test(code);
  
  const accessToken = user?.accessToken;

  // Fetch QR code, secret, and backup codes
  useEffect(() => {
    if (!accessToken) return;

    const fetch2FAData = async () => {
      try {
        const response = await fetch('https://localhost:8443/as/2fa/setup', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to setup 2FA');

        const data = await response.json();
        // setQrCodeUrl(data.qrCode); // already a ready-made PNG image (base64), must be use as <img src={qrCodeUrl} alt="2FA QR Code" />
        setQrCodeUrl(data.otpauthUrl); // generate the QR code dynamically
        setSetupKey(data.secret);
        setBackupCodes(data.backupCodes); // store backup codes
      } catch (err) {
        console.error(err);
      }
    };

    fetch2FAData();
  }, [accessToken]);

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

    // const result = await verify2FA(code, accessToken);
    // /2fa/confirmation
    const result = await confirm2FA(code, accessToken);
    
    setIsVerifying(false);

    if (result?.verified) {
      // navigate('/setup2fa-backup');
      navigate('/setup2fa-backup', { state: { backupCodes } }); // navigate to /setup2fa-backup and pass the codes in memory (via React Router state), best security.
    } else {
      // alert(t('pages.twoFactorAuth.setup.invalidCode'));
      setError(t('pages.twoFactorAuth.setup.invalidCode'));
    }
  };

  const handleCancel = async () => {
    if (!accessToken) {
      alert(t("common.errors.unauthorized"));
      navigate("/signin");
      return;
    }

    const success = await disable2FA(user.accessToken);
    if (success) {
      const profile: ProfileMeResponse | null = await fetchProfileMe(accessToken);
      if (profile) {
        setUser({
          ...user,
          twoFA: profile.TwoFAStatus,
        });
        navigate('/settings');
      }
    }
  }

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.twoFactorAuth.setup.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.twoFactorAuth.setup.title')}
      </h1>

      <ProgressBar 
        currentStep={1}
        stepCompletion={{ 1: formFilled }}
      />

      <section aria-labelledby="scanQrTitle" className="max-w-md text-center space-y-2">
        <h2 id="scanQrTitle" className="font-semibold text-center text-lg">
          {t('pages.twoFactorAuth.setup.scanQrTitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.setup.scanQrInstructions')}
        </p>
      </section>
 
        <div className='inline-block border-2 border-black rounded-3xl p-2'>
        {qrCodeUrl ? (
          <QRCodeGenerator
            value={qrCodeUrl} // Pass the fetched URL (the otpauth://... string) to the QRCodeGenerator
            size={256}
            fgColor='#000000'
            bgColor='#FFCC00'
          />
        ) : (
          <p>{t('pages.twoFactorAuth.setup.loadingQr')}</p>
        )}
        </div>

        <section className="max-w-md text-center space-y-2">
        <p>
          {t('pages.twoFactorAuth.setup.manualSetupPrompt')}{' '}
          <button
            className="underline"
            onClick={() => setShowManualSetup(true)}
            aria-label={t('pages.twoFactorAuth.setup.aria.manualSetupLink')}
          >
            {t('pages.twoFactorAuth.setup.manualSetupLink')}
          </button>{' '}
          {t('pages.twoFactorAuth.setup.manualSetupSuffix')}
        </p>

        <p>
          {t('pages.twoFactorAuth.setup.downloadAppInfo')}
        </p>
      </section>

      <section aria-labelledby="verifyCodeTitle" className="max-w-md text-center space-y-2">
        <h2 id="verifyCodeTitle" className="font-semibold text-center text-lg">
          {t('pages.twoFactorAuth.setup.verifyCodeTitle')}
        </h2>

      <form onSubmit={handleVerify} className="flex flex-col">
        <VerificationCodeInput
          onComplete={setCode}
          aria-label={t('pages.twoFactorAuth.setup.aria.verifyInput')}
          // Error handling: If user input fails validation, ensure accessible error messages
        />

        {isVerifying &&
          <p>{t('pages.twoFactorAuth.verify.checking')}</p>}

        {error &&
          <p className="text-red-600">
            {error}
          </p>}

      <div className="flex flex-wrap justify-center gap-6  mt-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.cancel')}
          // onClick={() => navigate('/settings')}
          onClick={handleCancel}
          aria-label={t('common.aria.buttons.cancel')}
        />
        <GenericButton
          type="submit"
          className="generic-button"
          text={t('common.buttons.next')}
          disabled={!formFilled || isVerifying}
          // onClick={handleVerify}
          aria-label={t('common.aria.buttons.next')}
        />
        </div>
        </form>
      </section>  
      
      {showManualSetup && (
        <div
          className="fixed inset-0 bg-[#FFCC00] bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="manualSetupTitle"
          aria-describedby="manualSetupInstructions"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2
              id="manualSetupTitle"
              className="font-semibold text-lg mb-4"
            >
              {t('pages.twoFactorAuth.setup.manualSetupTitle')}
            </h2>

            {setupKey ? (              
              <>
                <p id="manualSetupInstructions">
                  {t('pages.twoFactorAuth.setup.manualSetupInstructions')}
                </p>
                <div
                  className="mt-4 p-3 bg-[#FDFBD4] rounded font-mono break-all"
                  aria-label={t('pages.twoFactorAuth.setup.aria.setupKeyDisplay')}
                >
                  {setupKey}
                </div>
              </>
            ) : (
              <p>{t('pages.twoFactorAuth.setup.loadingSetupKeys')}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <GenericButton
                className="generic-button"
                text={t('common.buttons.ok')}
                aria-label={t('common.aria.buttons.ok')}
                onClick={() => setShowManualSetup(false)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Setup2faMainPage;