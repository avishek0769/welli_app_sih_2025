import { formatDistanceToNow } from 'date-fns';

export const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const isMessageFromUser = (message, userId) => {
    return message.senderId === userId;
};

export const getMessagePreview = (messages) => {
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.text.length > 30 ? lastMessage.text.substring(0, 30) + '...' : lastMessage.text;
};