import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'
import './index.css'
import { UserProvider } from '../context/UserContext.tsx';
import { DarkModeProvider } from '../context/DarkModeContext.tsx';
import { AccessibilityProvider } from '../context/AccessibilityContext.tsx';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const Providers = ({ children }: { children: ReactNode}) => {
    return (
        <UserProvider>
            <AccessibilityProvider>
                <DarkModeProvider>
                    {children}
                </DarkModeProvider>
            </AccessibilityProvider>
        </UserProvider>
    )
}

root.render(
    <Providers>
        <App />
    </Providers>
);


// To set up Google OAuth authentication, the clientId is required to 
// identify the app to Google's OAuth service when  rendering the component

// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// const clientId = "604876395020-v57ifnl042bi718lgm2lckhpbfqdog6b.apps.googleusercontent.com";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId={clientId}>
//       <App />
//     </GoogleOAuthProvider>
//   </React.StrictMode>
// );