import { StatusBar, useColorScheme } from 'react-native';
import {
    SafeAreaProvider,
    SafeAreaView,
} from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './src/TabNavigator';
import { NavigationContainer } from '@react-navigation/native';

function App() {
    const Stack = createNativeStackNavigator()

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={[]}>
                <StatusBar translucent backgroundColor="transparent" style="dark" />

                <NavigationContainer>
                    <Stack.Navigator initialRouteName="TabNavigator" screenOptions={{ headerShown: false }} >
                        <Stack.Screen name="TabNavigator" component={TabNavigator} />
                    </Stack.Navigator>
                </NavigationContainer>

            </SafeAreaView>
        </SafeAreaProvider>
    )
}


export default App;
