import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext({
    user: null,
    setUser: () => { },
    refreshUser: () => Promise.resolve(),
    loadingUser: false,
});

export const useUser = () => useContext(UserContext);

const USER_ME_ENDPOINT = 'https://your-backend.example.com/api/me';

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const fetchCurrentUser = useCallback(async () => {
        setLoadingUser(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(USER_ME_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) {
                setUser(null);
                setLoadingUser(false);
                return null;
            }
            const json = await res.json();
            // expected json to contain user object, e.g. { user: { id, fullName, avatar, ... } }
            const currentUser = json.user || json;
            setUser(currentUser);
            setLoadingUser(false);
            return currentUser;
        }
        catch (err) {
            setUser(null);
            setLoadingUser(false);
            return null;
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const value = {
        user,
        setUser,
        refreshUser: fetchCurrentUser,
        loadingUser,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;