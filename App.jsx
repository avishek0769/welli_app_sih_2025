import { StatusBar, useColorScheme } from 'react-native';
import {
    SafeAreaProvider,
    SafeAreaView,
} from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './src/TabNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ChatScreen from './src/screens/ChatScreen';

function App() {
    const Stack = createNativeStackNavigator()

    return (
        <GestureHandlerRootView>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={[]}>
                    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

                    <NavigationContainer>
                        <Stack.Navigator initialRouteName="TabNavigator" screenOptions={{ headerShown: false }} >
                            <Stack.Screen name="TabNavigator" component={TabNavigator} />
                            <Stack.Screen name="ChatScreen" component={ChatScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>

                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}


export default App;
