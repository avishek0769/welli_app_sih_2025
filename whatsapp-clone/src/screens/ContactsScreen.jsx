import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ContactItem from '../components/contacts/ContactItem';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchContacts } from '../services/contactService';

const ContactsScreen = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const fetchedContacts = await fetchContacts();
                setContacts(fetchedContacts);
            } catch (error) {
                console.error("Failed to fetch contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ContactItem contact={item} />}
                contentContainerStyle={styles.contactList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    contactList: {
        padding: 16,
    },
});

export default ContactsScreen;