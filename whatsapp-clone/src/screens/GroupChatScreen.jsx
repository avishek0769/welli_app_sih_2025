import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import { fetchGroupMessages } from '../services/chatService';

const GroupChatScreen = ({ route }) => {
    const { groupId, groupName } = route.params;
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        const loadMessages = async () => {
            const fetchedMessages = await fetchGroupMessages(groupId);
            setMessages(fetchedMessages);
        };

        loadMessages();
    }, [groupId]);

    const handleSendMessage = (messageText) => {
        // Logic to send a message
        // This could involve calling a service to send the message and then updating the state
    };

    return (
        <View style={styles.container}>
            <ChatHeader title={groupName} />
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MessageBubble message={item} />
                )}
                contentContainerStyle={styles.messagesContainer}
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
    messagesContainer: {
        padding: 16,
    },
});

export default GroupChatScreen;