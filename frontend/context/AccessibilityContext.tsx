import { useState, createContext, useContext, ReactNode } from 'react';

interface AccessibilityOptions {
    largeText: boolean;
    setLargeText: (text: boolean) => void;
}

const accessibilityContext = createContext<AccessibilityOptions | undefined>(undefined);

export const useAccessibilityContext = () => {
    const context = useContext(accessibilityContext);
    if (!context)
        throw new Error('Invalid use of accessibilityContext');
    return context;
}

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [largeText, setLargeText ] = useState<boolean>(false);

    return (
        <accessibilityContext.Provider value={{ largeText, setLargeText }}>
            {children}
        </accessibilityContext.Provider>
    )
}