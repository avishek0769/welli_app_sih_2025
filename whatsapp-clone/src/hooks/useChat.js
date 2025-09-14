import { useState, useEffect } from 'react';
import { fetchChatHistory, sendMessage as sendChatMessage } from '../services/chatService';

const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setLoading(true);
                const chatHistory = await fetchChatHistory(chatId);
                setMessages(chatHistory);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadChatHistory();
    }, [chatId]);

    const sendMessage = async (message) => {
        try {
            const newMessage = await sendChatMessage(chatId, message);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (err) {
            setError(err);
        }
    };

    return { messages, loading, error, sendMessage };
};

export default useChat;