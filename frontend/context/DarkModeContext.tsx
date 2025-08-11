import { useState, createContext, useContext, useEffect, ReactNode } from 'react';

interface DarkMode {
    darkMode: boolean;
    setDarkMode: (dark: boolean) => void;
}

const darkModeContext = createContext<DarkMode | undefined>(undefined);

export const useDarkModeContext = () => {
    const context = useContext(darkModeContext);
    if (!context)
        throw new Error('Invalid use of darkModeContext');
    return context;
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    return (
        <darkModeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </darkModeContext.Provider>
    )
}