import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import { fetchMessages } from '../services/chatService';

const ChatScreen = ({ route }) => {
    const { chatId, chatName } = route.params;
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const loadMessages = async () => {
            const chatMessages = await fetchMessages(chatId);
            setMessages(chatMessages);
        };

        loadMessages();
    }, [chatId]);

    const handleSendMessage = (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    return (
        <View style={styles.container}>
            <ChatHeader chatName={chatName} />
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <MessageBubble message={item} />}
                contentContainerStyle={styles.messagesList}
                inverted
            />
            <MessageInput onSend={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    messagesList: {
        padding: 16,
    },
});

export default ChatScreen;