// /src/pages/Auth/Setup2faBackup.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';

const Setup2faBackupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Simulate or handle actual backup code download logic here
  const handleDownload = () => {
    console.log('Recovery codes downloaded');  // TODO: implement actual download logic
    setHasDownloaded(true);
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
        text={t('pages.twoFactorAuth.backup.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.twoFactorAuth.backup.title')}
      </h1>

      <ProgressBar currentStep={2} stepCompletion={{ 1: true, 2: hasDownloaded }} />

      <section className="max-w-md text-center space-y-4">
        <h2 className="font-semibold text-center text-lg">
          {t('pages.twoFactorAuth.backup.backupTitle')}
        </h2>

        <p className="text-sm">
          {t('pages.twoFactorAuth.backup.backupInstructions')}
        </p>

        {/* Recovery codes fetch from backend
            TODO: black frame with round border with codes in 2 columns */} 
        <div className="border-2 border-black rounded-3xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <span className="bg-[#fdfBD4] p-2 rounded-xl text-center">ABCD-1234</span>
            <span className="bg-[#fdfBD4] p-2 rounded-xl text-center">EFGH-5678</span>
            <span className="bg-[#fdfBD4] p-2 rounded-xl text-center">IJKL-9101</span>
            <span className="bg-[#fdfBD4] p-2 rounded-xl text-center">MNOP-1122</span>
          </div>
        </div>

        <GenericButton
          className="generic-button"
          text={t('common.buttons.download')}
          onClick={handleDownload}
          aria-label={t('common.aria.buttons.download')}
        />

        <h2 className="font-semibold text-center text-lg mt-6">
          {t('pages.twoFactorAuth.backup.warningTitle')}
        </h2>

        <p className="text-sm">
          {t('pages.twoFactorAuth.backup.warningInfo')}
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.cancel')}
          onClick={() =>
            navigate('/signup')
          }
          aria-label={t('common.aria.buttons.cancel')}
        />

        <GenericButton
          className="generic-button"
          text={t('common.buttons.next')}
          disabled={!hasDownloaded}
          onClick={() =>
            navigate('/setup2fa-success')
          }
          aria-label={t('common.aria.buttons.next')}
        />
      </div>
    </main>
  );
};

export default Setup2faBackupPage;