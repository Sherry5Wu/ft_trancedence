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
  const formFilled = /^\d{6}$/.test(code);

  // Mock fetching the QR code URL (simulating backend)
  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // Simulate backend API call
        setTimeout(() => {
          setQrCodeUrl('https://www.example.com/2fa');  // This URL should come from the backend
        }, 1000); // Simulating a delay
      } catch (error) {
        console.error('Failed to fetch QR code:', error);
      }
    };

    fetchQRCode();
  }, []);

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
        {/* QR code fetch from backend */}
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
          <Link to="/404" className="underline" aria-label={t('pages.twoFactorAuth.setup.aria.manualSetupLink')}>
            {t('pages.twoFactorAuth.setup.manualSetupLink')}
          </Link>{' '}{t('pages.twoFactorAuth.setup.manualSetupSuffix')}
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
            navigate(-1)
          }
          aria-label={t('common.aria.buttons.cancel')}
        />
        <GenericButton
          className="generic-button"
          text={t('common.buttons.next')}
          disabled={!formFilled}
          onClick={() =>
            navigate('/setup2fa-backup')
          }
          aria-label={t('common.aria.buttons.next')}
        />
      </div>
    </main>
  );
};

export default Setup2faMainPage;