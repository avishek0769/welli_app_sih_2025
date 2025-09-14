import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChatHeader = ({ contactName, onVideoCallPress, onSettingsPress }) => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.contactName}>{contactName}</Text>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={onVideoCallPress}>
                    <Icon name="videocam" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSettingsPress}>
                    <Icon name="more-vert" size={24} color="#6C63FF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    contactName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ChatHeader;