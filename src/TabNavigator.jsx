import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Home from './screens/Home';
import { View, Text } from 'react-native';
import Chatbot from './screens/Chatbot';
import PeerSupport from './screens/PeerSupport';
import Resources from './screens/Resources';
import Counselling from './screens/Counselling';

// Placeholder components for other tabs
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingTop: 8,
                    paddingBottom: 10,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: "#6C63FF",
                tabBarInactiveTintColor: '#7B7B8A',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 4,
                },
                tabBarIconStyle: {
                    marginBottom: -2,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Chat"
                component={Chatbot}
                options={{
                    tabBarLabel: 'Chatbot',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="chat" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="PeerSupport"
                component={PeerSupport}
                options={{
                    tabBarLabel: 'Peer Support',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="group" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Booking"
                component={Counselling}
                options={{
                    tabBarLabel: 'Counseling',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="event" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Resources"
                component={Resources}
                options={{
                    tabBarLabel: 'Resources',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="book" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}