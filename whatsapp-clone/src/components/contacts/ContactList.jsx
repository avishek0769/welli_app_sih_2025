import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ContactItem from './ContactItem';

const ContactList = ({ contacts, onSelectContact }) => {
    const renderItem = ({ item }) => (
        <ContactItem contact={item} onPress={() => onSelectContact(item)} />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});

export default ContactList;