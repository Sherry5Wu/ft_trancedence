// /src/pages/CompleteProfile.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useValidationField } from '../../utils/Hooks';
import { isValidUsername, isValidPin } from '../../utils/Validation';
import { useUserContext } from '../../context/UserContext';
import { createUserFromGoogle } from "../../utils/Fetch";

const CompleteProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const pinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));
  const [confirmPin, setConfirmPin] = useState('');

  const pinMismatch =
    pinField.value &&
    confirmPin &&
    pinField.value !== confirmPin;

  const formFilled =
    usernameField.value !== '' &&
    pinField.value !== '' &&
    confirmPin !== '' &&
    !usernameField.error &&
    !pinField.error &&
    !pinMismatch;

  const idToken = sessionStorage.getItem("googleIdToken");

  // const handleSave = async () => {
  //   if (!idToken) {
  //     alert("Google sign-in is required before completing profile.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("https://localhost:8443/as/auth/google-complete", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         idToken,
  //         username: usernameField.value,
  //         pinCode: pinField.value,
  //       }),
  //     });

  //     if (!response.ok) throw new Error("Failed to complete profile");

  //     const newUser = await response.json();

  //     // Clear token after registration
  //     sessionStorage.removeItem("googleIdToken");

  //   // Map the backend response to userContext
  //   const userData = {
  //     username: newUser.user.username,
  //     id: newUser.user.id,
  //     email: "", // Not returned by backend
  //     profilePic: newUser.user.avatarUrl || '../assets/noun-profile-7808629.svg',
  //     score: 0, // Default because stats not returned yet
  //     rank: 0,  // Default because rank not returned yet
  //     rivals: [], // Default empty array
  //     accessToken: newUser.accessToken,
  //     refreshToken: newUser.refreshToken,
  //     twoFA: newUser.TwoFAStatus,
  //   };

  //   // Update context and navigate
  //   setUser(userData);
  //   navigate(`/user/${userData.username}`);

  //   } catch (err) {
  //     console.error("Error saving profile:", err);
  //     alert("Something went wrong, please try again.");
  //   }
  // };
const handleSave = async () => {
  if (!idToken) {
    alert("Google sign-in is required before completing profile.");
    return;
  }

  const newUser = await createUserFromGoogle({
    idToken,
    username: usernameField.value,
    pinCode: pinField.value,
  });

  if (!newUser) {
    alert("Something went wrong, please try again.");
    return;
  }

  // Clear token after registration
  sessionStorage.removeItem("googleIdToken");

  // Map backend response to context
  const userData = {
    username: newUser.user.username,
    id: newUser.user.id,
    email: "", // not returned by backend
    profilePic: newUser.user.avatarUrl || "../assets/noun-profile-7808629.svg",
    score: 0,
    rank: 0,
    rivals: [],
    accessToken: newUser.accessToken,
    refreshToken: newUser.refreshToken,
    twoFA: newUser.TwoFAStatus,
  };

  setUser(userData);
  navigate(`/user/${userData.username}`);
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
        text={t('pages.completeProfile.aria.description')}
      />
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col justify-center">
        <h1 id="pageTitle" className="font-semibold text-center">
          {t('pages.completeProfile.title')}
        </h1>

      <GenericInput
        type="text"
        placeholder={t('common.placeholders.username')}
        aria-label={t('common.aria.inputs.username')}
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameField.error}
      />

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.pin')}
        aria-label={t('common.aria.inputs.pin')}
        value={pinField.value}
        onFilled={pinField.onFilled}
        onBlur={pinField.onBlur}
        errorMessage={pinField.error}
        allowVisibility
      />

      <GenericInput
        type="password"
        placeholder={t('common.placeholders.confirmPin')}
        aria-label={t('common.aria.inputs.confirmPin')}
        value={confirmPin}
        onFilled={setConfirmPin}
        errorMessage={pinMismatch ? t('common.errors.pinMismatch') : ''}
        allowVisibility
      />

      <GenericButton
        className="generic-button"
        text={t('common.buttons.save')}
        aria-label={t('common.aria.buttons.save')}
        disabled={!formFilled}
        onClick={handleSave}
          />
      </div>
      </div>
    </main>
  );
};

export default CompleteProfilePage;

