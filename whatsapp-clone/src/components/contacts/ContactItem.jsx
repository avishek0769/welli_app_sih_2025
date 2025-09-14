import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '../common/Avatar';

const ContactItem = ({ contact, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Avatar source={{ uri: contact.avatar }} size={50} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{contact.name}</Text>
                <Text style={styles.status}>{contact.status}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    infoContainer: {
        marginLeft: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    status: {
        fontSize: 14,
        color: '#6B7280',
    },
});

export default ContactItem;