// pages/User/UserSettings.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { ToggleButton } from "../../components/ToggleButton";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  // Local state for editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Populate local state from user context
  useEffect(() => {
    if (user) {
      setFirstName(user?.firstname ?? '');
      setLastName(user?.lastname ?? '');
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center p-8 space-y-6">

      {/* Username header */}
      <div className='bigProfilePic'>
        {user?.profilePic}
      </div>

      <div>
        <h2 className='h2 mb-3'>{user?.username}</h2>      
      </div>

      {/* Account Settings */}
      <div className="flex flex-row w-full max-w-4xl gap-8 mt-6">
        <div className="flex flex-col p-4">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

          {/* First Name - Editable */}
          <GenericInput
            placeholder="First Name"
            value={firstName}
            onFilled={setFirstName}
            showEditIcon={true}
          />

          {/* Last Name - Editable */}
          <GenericInput
            placeholder="Last Name"
            value={lastName}
            onFilled={setLastName}
            showEditIcon={true}
          />

          {/* Email - Not editable */}
          <GenericInput
            placeholder="Email"
            value={user?.email || ''}
            onFilled={() => {}}
            disabled={true}
          />

          {/* Username - Not editable */}
          <GenericInput
            placeholder="Username"
            value={user?.username || ''}
            onFilled={() => {}}
            disabled={true}
          />

          {/* Save changes button */}
          <GenericButton
            className="generic-button"
            text="Save changes"
            onClick={() => {
              alert('Profile updated!'); // update user context or save to backend
            }}
          />
        </div>

        {/* Security and 2FA */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="text-lg font-semibold mb-4">Security</h3>

          <GenericButton
            className="generic-button"
            text="Change Password"
            onClick={() => navigate('/change-password')}
          />

          <GenericButton
            className="generic-button"
            text="Change PIN"
            onClick={() => navigate('/change-pin')}
          />

          <h3 className="text-lg font-semibold mb-4 mt-6">Two-factor authentication</h3>
          <p className="text-left text-sm">
            Two-factor authentication is an enhanced security measure. Once enabled, you’ll be required to give two types of identification when you log into this website. Google Authenticator is supported.
          </p>

          <ToggleButton
            label='2FA with Google Authenticator'
            onClick={() => navigate('/setup2fa')} // Enabled or disabled; fetch from user context?
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
