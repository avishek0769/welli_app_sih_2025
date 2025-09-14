import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../components/common/Header';

const SettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1F2153',
    },
    option: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    optionText: {
        fontSize: 18,
        color: '#1F2153',
    },
});

export default SettingsScreen;