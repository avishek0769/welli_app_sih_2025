import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
    return (
        <AuthProvider>
            <ChatProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </ChatProvider>
        </AuthProvider>
    );
};

export default App;