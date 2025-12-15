import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';

const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => { },
    socketId: null,
    setSocketId: () => { },
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [socketId, setSocketId] = useState(null);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const tokenExp = await AsyncStorage.getItem('accessTokenExp');
            if (!token || (tokenExp && new Date(tokenExp) <= new Date())) {
                refreshTokens();
                return;
            }
            const res = await fetch(`${BASE_URL}/api/v1/user/current`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 452) {
                refreshTokens();
                return;
            }
            const json = await res.json();
            const currentUser = json.data;
            setCurrentUser(currentUser);
        }
        catch (err) {
            setCurrentUser(null);
        }
    }, []);

    const updateOnlineStatus = async (isActive) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            await fetch(`${BASE_URL}/api/v1/user/online?isActive=${isActive}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    };

    const refreshTokens = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const refreshTokenExp = await AsyncStorage.getItem('refreshTokenExp');

            if (!refreshToken || (refreshTokenExp && new Date(refreshTokenExp) <= new Date())) {
                return;
            }

            const res = await fetch(`${BASE_URL}/api/v1/user/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                return;
            }

            const json = await res.json();
            
            await AsyncStorage.setItem('accessToken', json.data.accessToken);
            await AsyncStorage.setItem('refreshToken', json.data.refreshToken);
            fetchCurrentUser();
        }
        catch (error) {
            console.error('Failed to refresh tokens:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        updateOnlineStatus(true);      

        return () => {
            updateOnlineStatus(false);      
        };
    }, [fetchCurrentUser]);

    const value = {
        currentUser,
        setCurrentUser,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;