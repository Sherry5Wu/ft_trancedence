import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'
import './index.css'
import './i18n'; 
import { UserProvider } from '../context/UserContext.tsx';
import { AccessibilityProvider } from '../context/AccessibilityContext.tsx';
import { PlayersProvider } from '../context/PlayersContext.tsx';
import { ErrorBoundary } from '../context/ErrorBoundary.tsx';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const Providers = ({ children }: { children: ReactNode}) => {
    return (
        <UserProvider>
            <AccessibilityProvider>
                    <PlayersProvider>
                            {children}
                     </PlayersProvider>
            </AccessibilityProvider>
        </UserProvider>
    )
}

root.render(
    <ErrorBoundary>
        <Providers>
            <App />
        </Providers>
    </ErrorBoundary>
);