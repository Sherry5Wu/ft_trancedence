// pages/Auth/Setup2faMain.tsx
// user enters code from authenticator app to verify it works

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';
import VerificationCodeInput from '../../components/VerificationCodeInput';

const Setup2faMainPage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages
  
  const [code, setCode] = useState('');
  const formFilled = /^\d{6}$/.test(code); // Only valid when 6 digits
 
  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        {/* Page title */}
        <h3 className="font-semibold text-center">
          Setup Two-factor authentication</h3>

        {/* Progress bar component */}
        <ProgressBar currentStep={1} stepCompletion={{ 1: formFilled }} />

        {/* QR code */}
        <h4 className="font-semibold text-center">
          Scan the QR code</h4>
        <p className="text-center text-sm">
          Open the Google Authenticator app and scan this QR code.
      </p>

        
        {/* Redirect user to Set up keys manually */}  
        <p className="text-center text-sm">
        Unable to scan? You can use the {' '}
        <Link to="/404" className="underline">
          setup key</Link>
        {' '}to manually configure your authenticator app.
      </p>

        {/* Message to user */} 
        <p className="text-center text-sm">
          Don’t have the app? Google Authenticator is a free 2FA app. 
          Download it on your mobile device by searching for “Google Authenticator” on the Play Store or Apple Store.
      </p>
        
        {/* User input for TOTP (6-digit code)*/} 
        <h4 className="font-semibold text-center">
          Verify the code from the app</h4>
        <VerificationCodeInput 
          onComplete={setCode}
        />
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
          disabled={!formFilled}
          onClick={() => {
            navigate('/setup2fa-backup');
        }}
        />
      </div>
    </div>
  );
};

export default Setup2faMainPage;
