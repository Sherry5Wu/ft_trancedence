// pages/Auth/Setup2faSuccess.tsx
// 2FA enabled confirmation screen

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';
import SecurityIcon from '../../assets/noun-security-6758282.svg';

const Setup2faSuccessPage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        {/* Page title */}
        <h3 className="font-semibold text-center">
          Setup Two-factor authentication</h3>

        {/* Progress bar component */}
        <ProgressBar currentStep={3} stepCompletion={{ 1: true, 2: true, 3: true }} />


        <h4 className="font-semibold text-center">
          Two-factor authentication (2FA) is now enabled for you account!
        </h4>
        <p className="text-center text-sm">
          From now on, you’ll use Google Authenticator to sign in.
        </p>

        {/* Icon image */}
        <img 
          src={SecurityIcon} 
          alt="Security Icon" 
          className="w-40 h-40 mx-auto mb-4"
        />

        <p className="text-center text-sm">
          You have successfully enabled two-factor app authentication on your account. 2FA will be required even when signing in via Google or any third-party login method. From now on, whenever you sign in to your account, you’ll need to enter both your password and an authentication code. 
        </p>

      </div>
      {/* Cancel and Next Button */}
      <div className="flex flex-wrap justify-center gap-6">
        <GenericButton
          className="generic-button"
          text="DONE"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={() => {
            navigate('/homeuser'); // or this should redirect to 'signup' page? how to the infos already fill saved on the page?
          }}
        />
      </div>
    </div>
  );
};

export default Setup2faSuccessPage;