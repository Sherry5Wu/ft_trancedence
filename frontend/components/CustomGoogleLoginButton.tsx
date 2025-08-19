import { useGoogleLogin } from '@react-oauth/google';
// import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const CustomGoogleLoginButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  // const login = useGoogleLogin({
  //   onSuccess: tokenResponse => {
  //     console.log("Login Success:", tokenResponse);
  //     // You can call Google APIs or decode token if needed
  //   },
  //   onError: () => {
  //     console.error("Login Failed");
  //   }
  // });

  // Configure Google Login to return the ID Token
  const login = useGoogleLogin({
    flow: "implicit", // ensures token comes directly
    scope: "openid profile email", // required for id_token
    onSuccess: (tokenResponse) => {
      /**
       * tokenResponse contains:
       *   access_token
       *   authuser
       *   expires_in
       *   prompt
       *   scope
       *   token_type
       *   id_token   ✅
       */
      console.log("Google Login Success:", tokenResponse);

      if (tokenResponse.id_token) {
        // Save idToken in context
        setUser((prev) => ({
          ...prev,
          googleIdToken: tokenResponse.id_token,
        }));

        // Redirect to complete-registration page
        navigate("/signup/complete-registration");
      } else {
        console.error("No id_token returned from Google");
      }
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  
  return (
    <button
    type="button"
    className="google-signin-button"
    onClick={() => login()}
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
