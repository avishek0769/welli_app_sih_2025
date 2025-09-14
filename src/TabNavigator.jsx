import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Home from './pages/Home';
import { View, Text } from 'react-native';
import Chatbot from './pages/Chatbot';

// Placeholder components for other tabs
const PeerSupportScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Peer Support Screen</Text>
    </View>
);

const ResourcesScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Resources Screen</Text>
    </View>
);

const BookingScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Book Counseling Screen</Text>
    </View>
);

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
                component={PeerSupportScreen}
                options={{
                    tabBarLabel: 'Peer Support',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="group" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Booking"
                component={BookingScreen}
                options={{
                    tabBarLabel: 'Counseling',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="event" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Resources"
                component={ResourcesScreen}
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