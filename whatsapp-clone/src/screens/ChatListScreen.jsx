import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/common/Avatar';

const ChatListScreen = () => {
    const navigation = useNavigation();

    const chats = [
        { id: '1', name: 'John Doe', lastMessage: 'Hey, how are you?', time: '10:30 AM', avatar: 'https://example.com/avatar1.jpg' },
        { id: '2', name: 'Jane Smith', lastMessage: 'Let’s catch up soon!', time: '9:15 AM', avatar: 'https://example.com/avatar2.jpg' },
        { id: '3', name: 'Group Chat', lastMessage: 'Don’t forget the meeting tomorrow!', time: 'Yesterday', avatar: 'https://example.com/avatar3.jpg' },
    ];

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('ChatScreen', { chatId: item.id })}>
            <Avatar source={{ uri: item.avatar }} size={50} />
            <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                contentContainerStyle={styles.chatList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    chatList: {
        padding: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
    },
    chatMessage: {
        fontSize: 14,
        color: '#6B7280',
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default ChatListScreen;