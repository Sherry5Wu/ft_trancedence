// /src/pages/Auth/Setup2faBackup.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';

const Setup2faBackupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCodes = localStorage.getItem('backupCodes');
    if (storedCodes) {
      setBackupCodes(JSON.parse(storedCodes));
      setLoading(false);
    } else {
      setLoading(false);
      console.error('No backup codes found');
    }
  }, []);

  // // Simulate fetching backup codes from backend
  // useEffect(() => {
  //   const fetchBackupCodes = async () => {
  //     try {
  //       setTimeout(() => {
  //         // This array should come from the backend
  //         setBackupCodes([
  //           'ABCD-1234',
  //           'EFGH-5678',
  //           'IJKL-9101',
  //           'MNOP-1122',
  //           'QRST-3344',
  //           'UVWX-5566',
  //           'YZAB-7788',
  //           'CDEF-9900',
  //           'GHIJ-1111',
  //           'KLMN-2222',
  //         ]);
  //         setLoading(false);
  //       }, 1000); // Simulated delay
  //     } catch (error) {
  //       console.error('Failed to fetch backup codes:', error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchBackupCodes();
  // }, []);

  // Download file directly on the frontend a text file
  // 1. Convert the array of backup codes into a string, with each code on a new line.
  // 2. Create a Blob (a file-like object) containing the text, marked as plain text.
  // 3. Generate a temporary URL pointing to that Blob.
  // 4. Create an invisible anchor (<a>) element, set its href to the Blob URL,
  //    and give it a filename for the downloaded file.
  // 5. Simulate a click on the anchor to start the download.
  // 6. Revoke the temporary URL to free up memory.
  // 7. Update the state to indicate that the user has downloaded the file.
  const handleDownload = () => {
    const fileContent = backupCodes.join('\n');
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();

    URL.revokeObjectURL(url);
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

      <ProgressBar
        currentStep={2}
        stepCompletion={{ 1: true, 2: hasDownloaded }}
      />

      <section className="max-w-md text-center space-y-4">
        <h2 className="font-semibold text-center text-lg">
          {t('pages.twoFactorAuth.backup.backupTitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.backup.backupInstructions')}
        </p>

        {/* Recovery codes fetch from backend */}
        <div className="border-2 border-black rounded-3xl p-4 space-y-2">
          {loading ? (
            <p>{t('pages.twoFactorAuth.backup.loadingCodes')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {backupCodes.map((code, index) => (
                <span
                  key={index}
                  className="bg-[#fdfBD4] p-2 rounded-xl text-center"
                >
                  {code}
                </span>
              ))}
            </div>
          )}
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

        <p>
          {t('pages.twoFactorAuth.backup.warningInfo')}
        </p>
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