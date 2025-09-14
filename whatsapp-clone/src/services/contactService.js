import { getContacts, addContact } from '../utils/contactUtils';

export const fetchContacts = async () => {
    try {
        const contacts = await getContacts();
        return contacts;
    } catch (error) {
        throw new Error('Failed to fetch contacts');
    }
};

export const createContact = async (contact) => {
    try {
        const newContact = await addContact(contact);
        return newContact;
    } catch (error) {
        throw new Error('Failed to create contact');
    }
};