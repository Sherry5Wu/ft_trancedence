import { useState, createContext, useContext, ReactElement, ReactNode } from 'react';

interface User {
    username: string;
    profilePic: ReactElement;
    email: string;
}

interface UserType {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const userContext = createContext<UserType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    return (
        <userContext.Provider value={{ user, setUser }}>
            {children}
        </userContext.Provider>
    )
}