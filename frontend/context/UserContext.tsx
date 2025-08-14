import { useState, createContext, useContext, ReactElement, ReactNode, useEffect } from 'react';

interface User {
    username: string;
    id: string;
    profilePic: ReactElement;
    email: string;
    score: number;
    rank: number;
    // firstName: string;
    // lastName: string;
    rivals: string[];
    accessToken: string;
    refreshToken: string;
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

    // MOCKUP FOR TESTING, REMOVE LATER
    useEffect(() => {
    const mockUser: User = {
      username: 'Paddington',
      profilePic: <img src='../assets/profilepics/image.jpg' className='profilePic border-2' />,
      email: 'mock@user.com',
      score: 128,
      rank: 66,
      firstName: 'Bob',
      lastName: 'Smith',
      passWord: 12345,
    };
    setUser(mockUser);
  }, []);

    return (
        <userContext.Provider value={{ user, setUser }}>
            {children}
        </userContext.Provider>
    )
};