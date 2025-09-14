import { AsyncStorage } from 'react-native';

const MESSAGE_STORAGE_KEY = '@messages';

/**
 * Save a message to local storage.
 * @param {Object} message - The message object to save.
 */
export const saveMessage = async (message) => {
    try {
        const messages = await getMessages();
        messages.push(message);
        await AsyncStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
        console.error('Error saving message:', error);
    }
};

/**
 * Retrieve all messages from local storage.
 * @returns {Promise<Array>} - A promise that resolves to an array of messages.
 */
export const getMessages = async () => {
    try {
        const messages = await AsyncStorage.getItem(MESSAGE_STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return [];
    }
};

/**
 * Clear all messages from local storage.
 */
export const clearMessages = async () => {
    try {
        await AsyncStorage.removeItem(MESSAGE_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing messages:', error);
    }
};