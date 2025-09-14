import { useState, useEffect } from 'react';
import { fetchContacts } from '../services/contactService';

const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const fetchedContacts = await fetchContacts();
                setContacts(fetchedContacts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, []);

    return { contacts, loading, error };
};

export default useContacts;