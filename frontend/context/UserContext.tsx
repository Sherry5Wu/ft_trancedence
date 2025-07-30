import { useState, createContext, useContext, ReactElement, ReactNode, useEffect } from 'react';

interface User {
    username: string;
    profilePic: ReactElement;
    email: string;
};

interface UserType {
    user: User | null;
    setUser: (user: User | null) => void;
};

export const userContext = createContext<UserType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(userContext);
    if (!context)
        throw new Error('Invalid use of userContext');
    return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
    const mockUser: User = {
      username: 'MockUser',
      profilePic: <img src='../assets/profilepics/image.jpg' className='profilePic' />,
      email: 'mock@user.com',
    };
    setUser(mockUser);
  }, []);

    return (
        <userContext.Provider value={{ user, setUser }}>
            {children}
        </userContext.Provider>
    )
};