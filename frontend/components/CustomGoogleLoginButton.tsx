// CustomGoogleLoginButton.tsx
import React, { useEffect } from 'react';
// import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { signInGoogleUser } from '../utils/Fetch';

const CustomGoogleLoginButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setTokenReceived } = useUserContext();

  useEffect(() => {
    // global google
    if (window.google) {
      google.accounts.id.initialize({
        // THIS SHOULD BE PROTECTED .ENV
        client_id: "1050460559645-gq8j4unkacl92p5dmvllsehhp6aasbq7.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
    }
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    if (!idToken) {
      console.error("No ID token returned from Google");
      return;
    }

    // Save in sessionStorage so CompleteProfile page can access it
    // sessionStorage.setItem("googleIdToken", idToken);

    const signInData = await signInGoogleUser(idToken);

      if (!signInData) {
        alert("Login failed, please try again.");
        return;
      }

      if (signInData.needCompleteProfile) {
        navigate("/signup/complete-profile", { state: { googleIdToken: idToken } });

        // sessionStorage only for page refresh recovery
        sessionStorage.setItem("googleIdToken_fallback", idToken);
        return;
      }

      setUser({
        username: signInData.data.user.username,
        id: signInData.data.user.id,
        profilePic: signInData.data.user.avatarUrl || "../assets/noun-profile-7808629.svg",
        score: signInData.stats.score,
        rank: signInData.stats.score,
        rivals: signInData.rivals,
        accessToken: signInData.data.accessToken,
        expiry: Date.now() + 15 * 60 * 1000,
        twoFA: signInData.data.user.TwoFAStatus,
        googleUser: signInData.data.user.registerFromGoogle,
      });

	setTokenReceived(true);

      navigate(`/user/${signInData.data.user.username}`);
    };

  const handleClick = () => {
    if (!window.google) return alert("Google script not loaded yet");
    // Open the popup flow (works cross-browser)
    google.accounts.id.prompt(); 
  };

  return (
    <button
      type="button"
      className="google-signin-button"
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        aria-label={t('pages.signInWithGoogle.aria.signInWithGoogle')}
        focusable="false"
      >
        <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.4-34.3-4.1-50.6H272v95.7h146.9c-6.4 34.7-25.5 64.1-54.5 83.6v69.3h87.9c51.4-47.3 81.2-117 81.2-197.9z" />
        <path fill="#34a853" d="M272 544.3c73.7 0 135.5-24.5 180.7-66.4l-87.9-69.3c-24.4 16.4-55.5 26-92.8 26-71.4 0-132-48.1-153.7-112.6H28.4v70.7c45.1 89 137.9 151.6 243.6 151.6z" />
        <path fill="#fbbc05" d="M118.3 322c-10.3-30.5-10.3-63.7 0-94.2V157H28.4c-37.6 73.8-37.6 160.5 0 234.3l89.9-69.3z" />
        <path fill="#ea4335" d="M272 107.7c39.9 0 75.8 13.7 104 40.8l78-78C407.5 25.6 345.7 0 272 0 166.3 0 73.5 62.6 28.4 151.7l89.9 69.3C140 155.8 200.6 107.7 272 107.7z" />
      </svg>
      {t('pages.signInWithGoogle.button')}
    </button>
  );
};

export default CustomGoogleLoginButton;