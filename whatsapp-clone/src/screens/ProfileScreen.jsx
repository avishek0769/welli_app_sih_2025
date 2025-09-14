import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../components/common/Avatar';
import Header from '../components/common/Header';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.profileInfo}>
                <Avatar source={{ uri: 'https://example.com/user-avatar.jpg' }} size={100} />
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userStatus}>Available</Text>
            </View>
            <View style={styles.settingsContainer}>
                <Text style={styles.settingsTitle}>Settings</Text>
                {/* Add settings options here */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        padding: 16,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    userStatus: {
        fontSize: 16,
        color: '#6B7280',
    },
    settingsContainer: {
        marginTop: 16,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
});

export default ProfileScreen;