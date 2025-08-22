// import { useGoogleLogin } from '@react-oauth/google';
// // import { GoogleLogin } from "@react-oauth/google";
// import { useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useNavigate } from 'react-router-dom';
// import { useUserContext } from '../context/UserContext';

// const CustomGoogleLoginButton = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const { setUser } = useUserContext();



//   // ---- Popup Fallback (works in all browsers) ----
//   const popupLogin = useGoogleLogin({
//     flow: "implicit", // returns tokens directly
//     scope: "openid profile email",
//     onSuccess: (tokenResponse) => {
//       if (tokenResponse.id_token) {
//         console.log("Popup Google ID Token:", tokenResponse.id_token);

//         setUser((prev) => ({ ...prev, googleIdToken: tokenResponse.id_token }));
//         navigate("/signup/complete-profile");
//       } else {
//         console.error("Popup: No ID token returned from Google");
//       }
//     },
//     onError: () => console.error("Popup Google Login Failed"),
//   });

//   // ---- FedCM (only works in Chrome/Edge) ----
//   useEffect(() => {
//     if (!window.google || !window.google.accounts?.id) return;

//     window.google.accounts.id.initialize({
//       // client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
//       client_id: "1050460559645-gq8j4unkacl92p5dmvllsehhp6aasbq7.apps.googleusercontent.com",
//       callback: handleCredentialResponse,
//     });
//   }, []);

//   const handleCredentialResponse = (response: any) => {
//     const idToken = response.credential; // ✅ ID Token
//     console.log("FedCM Google ID Token:", idToken);

//     if (idToken) {
//       setUser((prev) => ({ ...prev, googleIdToken: idToken }));
//       navigate("/signup/complete-profile");
//     } else {
//       console.error("FedCM: No ID token returned from Google");
//       // fallback to popup if no token
//       popupLogin();
//     }
//   };

//   const handleClick = () => {
//     if (window.google?.accounts?.id) {
//       try {
//         // Try FedCM first
//         window.google.accounts.id.prompt((notification: any) => {
//           if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
//             console.warn("FedCM failed, falling back to popup login");
//             popupLogin();
//           }
//         });
//       } catch (err) {
//         console.error("FedCM error, using popup:", err);
//         popupLogin();
//       }
//     } else {
//       // If FedCM not available at all
//       popupLogin();
//     }
//   };






//   // useEffect(() => {
//   //   if (!window.google) return;

//   //   window.google.accounts.id.initialize({
//   //     // client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
//   //     client_id: "1050460559645-gq8j4unkacl92p5dmvllsehhp6aasbq7.apps.googleusercontent.com",
//   //     callback: handleCredentialResponse,
//   //   });
//   // }, []);

//   // const handleCredentialResponse = async (response: any) => {
//   //   const idToken = response.credential;
//   //   console.log("Google ID Token:", idToken);

//   //   if (!idToken) {
//   //     console.error("No ID token returned from Google");
//   //     return;
//   //   }

//   //   try {
//   //     // Send ID token to backend
//   //     const response = await fetch("https://localhost:8443/as/auth/google-login", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ idToken }),
//   //     });

//   //     if (!response.ok) throw new Error("Failed Google login request");

//   //     const data = await response.json();
//   //     console.log("Backend response:", data);

//   //     if (data.needCompleteProfile) {
//   //       // Save token so we can use it later in complete profile
//   //       setUser(prev => ({ ...prev, googleIdToken: idToken }));
//   //       navigate("/signup/complete-profile");
//   //     } else {
//   //       // Backend returned a fully registered user
//   //       setUser({
//   //         ...data,
//   //         accessToken: data.accessToken,
//   //         refreshToken: data.refreshToken,
//   //       });
//   //       navigate(`/user/${data.username}`);
//   //     }
//   //   } catch (err) {
//   //     console.error("Google login error:", err);
//   //     alert("Login failed. Please try again.");
//   //   }
//   // };

//   // const handleClick = () => {
//   //   if (window.google?.accounts) {
//   //     window.google.accounts.id.prompt();
//   //   } else {
//   //     console.error("Google script not loaded yet");
//   //   }
//   // };


//   return (
//     <button
//     type="button"
//     className="google-signin-button"
//     onClick={handleClick}
//   >
//     <svg
//       viewBox="0 0 533.5 544.3"
//       xmlns="http://www.w3.org/2000/svg"
//       aria-hidden="true"
//       aria-label={t('pages.signInWithGoogle.aria.signInWithGoogle')}
//       focusable="false"
//     >
//         <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.4-34.3-4.1-50.6H272v95.7h146.9c-6.4 34.7-25.5 64.1-54.5 83.6v69.3h87.9c51.4-47.3 81.2-117 81.2-197.9z" />
//         <path fill="#34a853" d="M272 544.3c73.7 0 135.5-24.5 180.7-66.4l-87.9-69.3c-24.4 16.4-55.5 26-92.8 26-71.4 0-132-48.1-153.7-112.6H28.4v70.7c45.1 89 137.9 151.6 243.6 151.6z" />
//         <path fill="#fbbc05" d="M118.3 322c-10.3-30.5-10.3-63.7 0-94.2V157H28.4c-37.6 73.8-37.6 160.5 0 234.3l89.9-69.3z" />
//         <path fill="#ea4335" d="M272 107.7c39.9 0 75.8 13.7 104 40.8l78-78C407.5 25.6 345.7 0 272 0 166.3 0 73.5 62.6 28.4 151.7l89.9 69.3C140 155.8 200.6 107.7 272 107.7z" />
//     </svg>
//       {t('pages.signInWithGoogle.button')}
//   </button>
//   );
// };

// export default CustomGoogleLoginButton;







// CustomGoogleLoginButton.tsx
import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';


const CustomGoogleLoginButton: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  // access token recieved:
  // const login = useGoogleLogin({
  //   flow: "implicit", // ensures we get id_token directly
  //   scope: "openid profile email",
  //   response_type: "id_token", // 👈 ensure ID token is returned
  //   onSuccess: async (tokenResponse) => {
  //     try {
  //       // In implicit flow, tokenResponse has `credential` or `id_token`
  //       const idToken = tokenResponse.id_token || (tokenResponse as any).credential;

  //       if (!idToken) {
  //         console.error("No ID token returned from Google", tokenResponse);
  //         return;
  //       }

  //       // Save token in context + sessionStorage (for reload safety)
  //       setUser((prev) => ({ ...prev, googleIdToken: idToken }));
  //       sessionStorage.setItem("googleIdToken", idToken);

  //       // Send token to backend for pre-check
  //       const res = await fetch("https://localhost:8443/as/auth/google-login",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ idToken }),
  //       });

  //       if (!res.ok) throw new Error("Backend login failed");

  //       const result = await res.json();

  //       if (result.needCompleteProfile) {
  //         navigate("/signup/complete-profile");
  //       } else {
  //         // If backend returns user data, update context
  //         setUser((prev) => ({ ...prev, ...result }));
  //         navigate(`/user/${result.username}`);
  //       }
  //     } catch (err) {
  //       console.error("Error during Google login:", err);
  //       alert("Login failed, please try again.");
  //     }
  //   },
  //   onError: () => {
  //     console.error("Google login failed");
  //   },
  // });


  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
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
    sessionStorage.setItem("googleIdToken", idToken);

    try {
      const backendRes = await fetch("https://localhost:8443/as/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!backendRes.ok) throw new Error("Backend login failed");

      const result = await backendRes.json();

      if (result.needCompleteProfile) {
        navigate("/signup/complete-profile");
      } else {
        navigate('/about');
        // setUser(prev => ({ ...prev, ...result }));
        // navigate(`/user/${result.username}`);
      }
    } catch (err) {
      console.error("Error during Google login:", err);
      alert("Login failed, please try again.");
    }
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
      // onClick={() => login()}
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
