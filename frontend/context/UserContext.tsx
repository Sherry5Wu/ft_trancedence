import { useState, createContext, useContext, ReactElement, ReactNode } from 'react';

interface User {
    username: string;
    profilePicture: ReactElement;
    email: string;
}

interface UserType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const userContext = createContext<UserType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const user = useState()

    return (
        <userContext.Provider>
        </userContext.Provider>
    )
}