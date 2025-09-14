import { useState, useEffect } from 'react';
import { fetchMessages, sendMessage as apiSendMessage } from '../services/messageService';

const useMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                setLoading(true);
                const fetchedMessages = await fetchMessages(chatId);
                setMessages(fetchedMessages);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [chatId]);

    const sendMessage = async (message) => {
        try {
            const newMessage = await apiSendMessage(chatId, message);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (err) {
            setError(err);
        }
    };

    return { messages, loading, error, sendMessage };
};

export default useMessages;