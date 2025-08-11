// pages/Auth/Verify2fa.tsx
// during login, user enters 2FA code

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import VerificationCodeInput from '../../components/VerificationCodeInput';

const Verify2faPage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages
  
  const [code, setCode] = useState('');
  const formFilled = /^\d{6}$/.test(code); // Only valid when 6 digits
 
  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        {/* Page title */}
        <h3 className="font-semibold text-center">
          Two-factor Authentication</h3>

        {/* Message to user */}
        <h4 className="font-semibold text-center">
          Verify your account</h4>
        <p className="text-center text-sm">
          You have 2FA enabled on this account. Please enter the verification code from your Google Authenticator app to complete the login process.
      </p>

        {/* User input for TOTP (6-digit code)*/} 
        <h4 className="font-semibold text-center">
          Verify the code from the app</h4>
        <VerificationCodeInput 
          onComplete={setCode}
        />
      </div>


      {/* Verify Button */}
      <div className="flex flex-wrap justify-center items-center gap-6">
        <GenericButton
          className="generic-button"
          text="VERIFY"
          icon={undefined}
          hoverLabel={undefined}
          disabled={!formFilled}
          onClick={() => {
            navigate('/homeuser');
        }}
        />
      </div>

    {/* Redirect user to Set up keys manually */}  
      <div className="flex flex-col items-center">       
                <p className="text-center text-sm">
              Can’t find your device? {' '}
              <Link to="/404" className="underline">
                Use a backup code</Link>
            </p>
      </div>
    </div>
  );
};

export default Verify2faPage;
