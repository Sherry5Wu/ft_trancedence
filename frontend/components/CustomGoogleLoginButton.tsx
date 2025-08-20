// import { useGoogleLogin } from '@react-oauth/google';
// import { GoogleLogin } from "@react-oauth/google";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const CustomGoogleLoginButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  // Configure Google Login to return the ID Token
  // const login = useGoogleLogin({
  //   flow: "implicit", // ensures token comes directly
  //   scope: "openid profile email", // required for id_token
  //   onSuccess: (tokenResponse) => {
  //     /**
  //      * tokenResponse contains:
  //      *   access_token
  //      *   authuser
  //      *   expires_in
  //      *   prompt
  //      *   scope
  //      *   token_type
  //      *   id_token   ✅
  //      */
  //     console.log("Google Login Success:", tokenResponse);

  //     if (tokenResponse.id_token) {
  //       // Save idToken in context
  //       setUser((prev) => ({
  //         ...prev,
  //         googleIdToken: tokenResponse.id_token,
  //       }));

  //       // Redirect to complete-registration page
  //       navigate("/signup/complete-registration");
  //     } else {
  //       console.error("No id_token returned from Google");
  //     }
  //   },
  //   onError: () => {
  //     console.error("Google Login Failed");
  //   },
  // });


// const login = useGoogleLogin({
//   flow: "auth-code",  
//   scope: "openid profile email",
//   onSuccess: async (codeResponse) => {
//     try {
//       // Step 1: exchange code for idToken in backend
//       const response = await fetch("https://localhost:8443/as/auth/google-register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code: codeResponse.code }),
//       });
      
// console.log("Response status:", response.status); // debug
// console.log("Response text:", await response.text()); // debug

//       if (!response.ok) throw new Error("Failed to exchange code");

//       const data = await response.json();

//       if (data.id_token) {
//         // Save id_token in context for later use
//         setUser(prev => ({ ...prev, googleIdToken: data.id_token }));

//         // Go to complete registration page
//         navigate("/signup/complete-registration");
//       } else {
//         console.error("Backend did not return id_token");
//       }
//     } catch (err) {
//       console.error("Google exchange error:", err);
//     }
//   },
//   onError: () => console.error("Google Login Failed"),
// });

  useEffect(() => {

    if (!window.google) return;

    window.google.accounts.id.initialize({
      // client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      client_id: "1050460559645-gq8j4unkacl92p5dmvllsehhp6aasbq7.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
  }, []);

  const handleCredentialResponse = (response: any) => {
    const idToken = response.credential; // ✅ ID Token (JWT)
    console.log("Google ID Token:", idToken);

    if (idToken) {
      setUser((prev) => ({ ...prev, googleIdToken: idToken }));
      navigate('/signup/complete-profile');
    } else {
      console.error("No ID token returned from Google");
    }
  };

const handleClick = () => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.prompt();
  } else {
    console.error("Google script not loaded yet");
  }
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
