import { AsyncStorage } from 'react-native';

const CHAT_HISTORY_KEY = 'chatHistory';

// Function to fetch chat history
export const fetchChatHistory = async () => {
    try {
        const chatHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        return chatHistory ? JSON.parse(chatHistory) : [];
    } catch (error) {
        console.error('Failed to fetch chat history:', error);
        return [];
    }
};

// Function to save chat history
export const saveChatHistory = async (chatHistory) => {
    try {
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
};

// Function to send a message
export const sendMessage = async (message) => {
    try {
        const chatHistory = await fetchChatHistory();
        chatHistory.push(message);
        await saveChatHistory(chatHistory);
    } catch (error) {
        console.error('Failed to send message:', error);
    }
};