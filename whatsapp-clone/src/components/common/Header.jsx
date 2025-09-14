import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title }) => {
    return (
        <View style={styles.headerContainer}>
            <Icon name="chat" size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>{title}</Text>
            <Icon name="more-vert" size={24} color="#FFFFFF" />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#6C63FF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default Header;