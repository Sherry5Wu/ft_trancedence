import { useState, createContext, useContext, useRef, ReactNode, useEffect } from 'react';
import { UserContextType, User } from '../utils/Interfaces';
import { data } from 'autoprefixer';

export const userContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(userContext);
    if (!context)
        throw new Error('Invalid use of userContext');
    return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const refresh = async () => {
        try {
            const response = await fetch('https://localhost:8443/as/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok)
            {
                setUser(null);
                return null;
            }
            const data = await response.json();
            const newExpiration = Date.now() + 15 * 60 * 1000; //replace with something from backend?
			console.log("REFRESH OK");

            setUser({
                ...data.user,
                expiry: newExpiration,
                accessToken: data.accessToken,
            });

            return data.accessToken;
		}
        catch {
            setUser(null);
            return null;
        }
    };


	const logOut = async () => {
		try {
			const response = await fetch('https://localhost:8443/as/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});

			if (!response.ok)
				throw new Error(`HTTP error! Status: ${response.status}`);
		}
		catch(error) {
			console.log('Log out failed: ', error);
		}
		finally {
			setUser(null);
			console.log('LOGGING OUT');
		}
	}

	useEffect(() => {
		refresh();
	}, []);

    return (
        <userContext.Provider value={{ user, setUser, refresh, logOut }}>
            {children}
        </userContext.Provider>
    )
};
