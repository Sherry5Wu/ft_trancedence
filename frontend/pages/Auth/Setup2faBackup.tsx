// pages/Auth/Setup2faBackup.tsx
// user downloads recovery codes or sets backup

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';

const Setup2faBackupPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Simulate file download or real API call
  const handleDownload = () => {
    // Here actually fetch the backup codes (trigger the download)
    console.log('Recovery codes downloaded'); // replace with actual logic
    setHasDownloaded(true);
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        <h3 className="font-semibold text-center">
          Setup Two-factor authentication
        </h3>

        <h4 className="font-semibold text-center">
          Backup verification codes
        </h4>
        <p className="text-center text-sm">
          With 2FA enabled for your account, you can use the recovery codes as a second factor to authenticate 
          in case you lose your device. We recommend keeping them in a secure place.
        </p>

        {/* Download Button */}
        <GenericButton
          className="generic-button"
          text="DOWNLOAD"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={handleDownload}
        />

        <h4 className="font-semibold text-center">
          Keep your recovery codes in a safe spot
        </h4>
        <p className="text-center text-sm">
          If you lose your device and can’t find your recovery codes, you will lose access to your account.
        </p>
      </div>

      {/* Cancel and Next Button */}
      <div className="flex flex-wrap justify-center gap-6">
        <GenericButton
          className="generic-button"
          text="CANCEL"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={() => {
            navigate('/signup');
          }}
        />

        <GenericButton
          className="generic-button"
          text="NEXT"
          icon={undefined}
          hoverLabel={undefined}
          disabled={!hasDownloaded}
          onClick={() => {
            alert('Go to Success page!');
          }}
        />
      </div>
    </div>
  );
};

export default Setup2faBackupPage;
