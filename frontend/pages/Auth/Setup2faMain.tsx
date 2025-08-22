// /src/pages/Auth/Setup2faMain.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import QRCodeGenerator from '../../components/QRCodeGenerator';

const Setup2faMainPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [setupKey, setSetupKey] = useState<string | null>(null);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const formFilled = /^\d{6}$/.test(code);

  // // Simulate fetching QR code URL and setup key together
  // useEffect(() => {
  //   const fetch2FAData = async () => {
  //     try {
  //       setTimeout(() => {
  //         setQrCodeUrl('https://www.example.com/2fa');
  //         setSetupKey('ABCD EFGH IJKL MNOP');
  //       }, 2000); // Simulated delay
  //     } catch (error) {
  //       console.error('Failed to fetch 2FA data:', error);
  //     }
  //   };

  //   fetch2FAData();
  // }, []);

  useEffect(() => {
    const fetch2FAData = async () => {
      try {
        const response = await fetch('https://localhost:8443/as/auth/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // ensures cookie/JWT is sent
        });
        if (!response.ok) throw new Error('Failed to setup 2FA');
        const data = await response.json();
        setQrCodeUrl(data.qrCode);
        setSetupKey(data.secret);
        // store backup codes temporarily in localStorage to show in next step
        localStorage.setItem('backupCodes', JSON.stringify(data.backupCodes));
      } catch (err) {
        console.error(err);
      }
    };
    fetch2FAData();
  }, []);

  const handleVerify = async () => {
    try {
      const response = await fetch('https://localhost:8443/as/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: code }),
      });
      const data = await response.json();
      if (data.verified) {
        navigate('/setup2fa-backup');
      } else {
        alert('Invalid code, try again');
      }
    } catch (err) {
      console.error(err);
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

        <div className='inline-block border-2 border-black rounded-3xl p-6'>
        {qrCodeUrl ? (
          <QRCodeGenerator
            value={qrCodeUrl} // Pass the fetched URL to the QRCodeGenerator
            size={256}
            fgColor='#000000'
            bgColor='#FFFFFF'
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

        <VerificationCodeInput
          onComplete={setCode}
          aria-label={t('pages.twoFactorAuth.setup.aria.verifyInput')}
          // Error handling: If user input fails validation, ensure accessible error messages
          // are displayed and linked with aria-describedby or aria-invalid attributes.
          // Check this when backend is connected to frontend
        />
      </section>

      <div className="flex flex-wrap justify-center gap-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.cancel')}
          onClick={() =>
            navigate('/settings')
          }
          aria-label={t('common.aria.buttons.cancel')}
        />
        <GenericButton
          className="generic-button"
          text={t('common.buttons.next')}
          disabled={!formFilled}
          // onClick={() =>
          //   navigate('/setup2fa-backup')
          // }
          onClick={handleVerify}
          aria-label={t('common.aria.buttons.next')}
        />
      </div>
      
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