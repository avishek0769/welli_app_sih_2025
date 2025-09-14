import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgUri } from 'react-native-svg';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

/* ---------- Chat List Item Component ---------- */
const ChatListItem = ({ chat, onPress }) => {
    return (
        <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
                {chat.type === 'group' ? (
                    <View style={styles.groupAvatar}>
                        <Icon name="group" size={24} color="#6C63FF" />
                    </View>
                ) : (
                    <View style={styles.svgAvatarContainer}>
                        <SvgUri
                            uri={chat.avatar}
                            width={50}
                            height={50}
                        />
                    </View>
                )}
                {chat.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
                    <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
                </View>

                <View style={styles.chatPreview}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {chat.type === 'group' && chat.lastMessageSender ?
                            `${chat.lastMessageSender}: ${chat.lastMessage}` :
                            chat.lastMessage
                        }
                    </Text>
                    {chat.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

/* ---------- Main Peer Support Component ---------- */
const PeerSupport = () => {
    const navigation = useNavigation();

    // Generate cartoon SVG avatars for anonymity
    const getCartoonAvatar = (seed) => {
        const cartoonAvatars = [
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoey',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Max',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Cleo',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Rex',
            'https://api.dicebear.com/9.x/personas/svg?seed=Peaceful',
            'https://api.dicebear.com/9.x/personas/svg?seed=Mindful',
            'https://api.dicebear.com/9.x/personas/svg?seed=Calm',
            'https://api.dicebear.com/9.x/personas/svg?seed=Strong',
            'https://api.dicebear.com/9.x/personas/svg?seed=Brave',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Hope',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Gentle',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Rising',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Quiet',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Inner',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Sophie',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver',
            'https://api.dicebear.com/9.x/personas/svg?seed=Emma',
            'https://api.dicebear.com/9.x/personas/svg?seed=Liam',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Ava',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Noah',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Isabella',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=William',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Charlotte',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=James',
        ];
        return cartoonAvatars[seed % cartoonAvatars.length];
    };

    // Anonymous names for privacy
    const anonymousNames = [
        'Mindful_Soul_23',
        'Peaceful_Heart_89',
        'Strong_Mind_45',
        'Calm_Spirit_67',
        'Brave_Journey_12',
        'Hope_Walker_34',
        'Gentle_Wind_78',
        'Rising_Phoenix_56',
        'Quiet_Strength_91',
        'Inner_Light_25'
    ];

    // Mock chat data with random but static anonymous names and cartoon avatars
    const chats = [
        {
            id: '1',
            name: 'Anxiety Support Group',
            type: 'group',
            participants: 15,
            lastMessage: 'Thanks for sharing your experience',
            lastMessageSender: 'Mindful_Soul_23',
            lastMessageTime: '2:30 PM',
            unreadCount: 3,
            isOnline: true,
        },
        {
            id: '2',
            name: 'Peaceful_Heart_89',
            type: 'individual',
            avatar: getCartoonAvatar(2),
            lastMessage: 'How are you feeling today?',
            lastMessageTime: '1:45 PM',
            unreadCount: 1,
            isOnline: true,
        },
        {
            id: '3',
            name: 'College Stress Support',
            type: 'group',
            participants: 8,
            lastMessage: 'I can totally relate to that',
            lastMessageSender: 'Strong_Mind_45',
            lastMessageTime: '12:20 PM',
            unreadCount: 0,
            isOnline: false,
        },
        {
            id: '4',
            name: 'Calm_Spirit_67',
            type: 'individual',
            avatar: getCartoonAvatar(4),
            lastMessage: 'That meditation app really helped!',
            lastMessageTime: '11:30 AM',
            unreadCount: 0,
            isOnline: false,
        },
        {
            id: '5',
            name: 'Depression Support Circle',
            type: 'group',
            participants: 12,
            lastMessage: 'Remember, you\'re not alone in this',
            lastMessageSender: 'Brave_Journey_12',
            lastMessageTime: '10:15 AM',
            unreadCount: 5,
            isOnline: true,
        },
        {
            id: '6',
            name: 'Hope_Walker_34',
            type: 'individual',
            avatar: getCartoonAvatar(6),
            lastMessage: 'Hope you\'re doing well today',
            lastMessageTime: 'Yesterday',
            unreadCount: 0,
            isOnline: true,
        },
        {
            id: '7',
            name: 'Gentle_Wind_78',
            type: 'individual',
            avatar: getCartoonAvatar(7),
            lastMessage: 'The breathing exercises helped me a lot',
            lastMessageTime: 'Yesterday',
            unreadCount: 2,
            isOnline: false,
        },
        {
            id: '8',
            name: 'Rising_Phoenix_56',
            type: 'individual',
            avatar: getCartoonAvatar(8),
            lastMessage: 'Thank you for listening',
            lastMessageTime: '2 days ago',
            unreadCount: 0,
            isOnline: true,
        },
        {
            id: '9',
            name: 'Quiet_Strength_91',
            type: 'individual',
            avatar: getCartoonAvatar(9),
            lastMessage: 'Your advice really helped me',
            lastMessageTime: '2 days ago',
            unreadCount: 0,
            isOnline: false,
        },
        {
            id: '10',
            name: 'Inner_Light_25',
            type: 'individual',
            avatar: getCartoonAvatar(10),
            lastMessage: 'Good morning! Ready for today?',
            lastMessageTime: '3 days ago',
            unreadCount: 1,
            isOnline: true,
        },
    ];

    // Mock messages with anonymous names and cartoon avatars
    const getMockMessages = (chatId) => {
        const messagesByChat = {
            '1': [
                { id: '1', text: 'Hi everyone! How is everyone doing today?', sender: 'peer', senderName: 'Mindful_Soul_23', time: '2:20 PM', avatar: getCartoonAvatar(1) },
                { id: '2', text: 'I\'m doing better than yesterday, thanks for asking!', sender: 'peer', senderName: 'Quiet_Strength_91', time: '2:22 PM', avatar: getCartoonAvatar(9) },
                { id: '3', text: 'That\'s great to hear! 😊', sender: 'user', senderName: 'You', time: '2:25 PM' },
                { id: '4', text: 'Thanks for sharing your experience', sender: 'peer', senderName: 'Mindful_Soul_23', time: '2:30 PM', avatar: getCartoonAvatar(1) },
            ],
            '2': [
                { id: '1', text: 'Hello! I hope you\'re having a good day.', sender: 'other', senderName: 'Peaceful_Heart_89', time: '1:40 PM', avatar: getCartoonAvatar(2) },
                { id: '2', text: 'How are you feeling today?', sender: 'other', senderName: 'Peaceful_Heart_89', time: '1:45 PM', avatar: getCartoonAvatar(2) },
            ],
            '3': [
                { id: '1', text: 'Welcome to the college stress support group!', sender: 'peer', senderName: 'Strong_Mind_45', time: '12:15 PM', avatar: getCartoonAvatar(3) },
                { id: '2', text: 'I can totally relate to that', sender: 'peer', senderName: 'Strong_Mind_45', time: '12:20 PM', avatar: getCartoonAvatar(3) },
            ],
            '4': [
                { id: '1', text: 'Hey! How\'s your meditation practice going?', sender: 'other', senderName: 'Calm_Spirit_67', time: '11:25 AM', avatar: getCartoonAvatar(4) },
                { id: '2', text: 'That meditation app really helped!', sender: 'other', senderName: 'Calm_Spirit_67', time: '11:30 AM', avatar: getCartoonAvatar(4) },
            ],
            '5': [
                { id: '1', text: 'Good morning everyone. How are we all feeling today?', sender: 'peer', senderName: 'Brave_Journey_12', time: '10:10 AM', avatar: getCartoonAvatar(5) },
                { id: '2', text: 'Remember, you\'re not alone in this', sender: 'peer', senderName: 'Brave_Journey_12', time: '10:15 AM', avatar: getCartoonAvatar(5) },
            ],
            '6': [
                { id: '1', text: 'Hi! Just checking in on you.', sender: 'other', senderName: 'Hope_Walker_34', time: 'Yesterday', avatar: getCartoonAvatar(6) },
                { id: '2', text: 'Hope you\'re doing well today', sender: 'other', senderName: 'Hope_Walker_34', time: 'Yesterday', avatar: getCartoonAvatar(6) },
            ],
            '7': [
                { id: '1', text: 'The breathing exercises you suggested are amazing!', sender: 'other', senderName: 'Gentle_Wind_78', time: 'Yesterday', avatar: getCartoonAvatar(7) },
                { id: '2', text: 'The breathing exercises helped me a lot', sender: 'other', senderName: 'Gentle_Wind_78', time: 'Yesterday', avatar: getCartoonAvatar(7) },
            ],
            '8': [
                { id: '1', text: 'I really appreciate this community', sender: 'other', senderName: 'Rising_Phoenix_56', time: '2 days ago', avatar: getCartoonAvatar(8) },
                { id: '2', text: 'Thank you for listening', sender: 'other', senderName: 'Rising_Phoenix_56', time: '2 days ago', avatar: getCartoonAvatar(8) },
            ],
            '9': [
                { id: '1', text: 'I\'ve been practicing the techniques we discussed', sender: 'other', senderName: 'Quiet_Strength_91', time: '2 days ago', avatar: getCartoonAvatar(9) },
                { id: '2', text: 'Your advice really helped me', sender: 'other', senderName: 'Quiet_Strength_91', time: '2 days ago', avatar: getCartoonAvatar(9) },
            ],
            '10': [
                { id: '1', text: 'Starting my day with gratitude today!', sender: 'other', senderName: 'Inner_Light_25', time: '3 days ago', avatar: getCartoonAvatar(10) },
                { id: '2', text: 'Good morning! Ready for today?', sender: 'other', senderName: 'Inner_Light_25', time: '3 days ago', avatar: getCartoonAvatar(10) },
            ],
        };
        return messagesByChat[chatId] || [];
    };

    const handleChatPress = (chatId) => {
        const selectedChat = chats.find(chat => chat.id === chatId);
        const messages = getMockMessages(chatId);

        navigation.navigate('ChatScreen', {
            chat: selectedChat,
            messages: messages,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <View style={styles.chatListHeader}>
                <Text style={styles.screenTitle}>Messages</Text>
                <TouchableOpacity style={styles.newChatButton}>
                    <Icon name="edit" size={20} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatListItem
                        chat={item}
                        onPress={() => handleChatPress(item.id)}
                    />
                )}
                style={styles.chatList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                    <View style={{ height: 70 }} />
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },

    // Chat List Styles
    chatListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
    },
    newChatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatList: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFF',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    groupAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    svgAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    chatPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default PeerSupport;