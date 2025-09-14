import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList, 
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';

// Move avatar generation outside component to prevent re-creation
const avatarCache = {};

const cartoonAvatars = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoey',
    'https://api.dicebear.com/9.x/personas/svg?seed=Peaceful',
    'https://api.dicebear.com/9.x/personas/svg?seed=Mindful',
    'https://api.dicebear.com/9.x/big-smile/svg?seed=Hope',
    'https://api.dicebear.com/9.x/big-smile/svg?seed=Gentle',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Quiet',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Inner',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Sophie',
];

const getCartoonAvatar = (seed) => {
    if (avatarCache[seed]) {
        return avatarCache[seed];
    }
    
    const avatar = cartoonAvatars[seed % cartoonAvatars.length];
    avatarCache[seed] = avatar;
    return avatar;
};

// Pre-generate peer data with static avatars
const peerData = [
    { name: 'Mindful_Soul_23', avatar: getCartoonAvatar(1), isOnline: true, lastSeen: 'Online' },
    { name: 'Peaceful_Heart_89', avatar: getCartoonAvatar(2), isOnline: false, lastSeen: '5 mins ago' },
    { name: 'Strong_Mind_45', avatar: getCartoonAvatar(3), isOnline: true, lastSeen: 'Online' },
    { name: 'Calm_Spirit_67', avatar: getCartoonAvatar(4), isOnline: false, lastSeen: '1 hour ago' },
    { name: 'Brave_Journey_12', avatar: getCartoonAvatar(5), isOnline: true, lastSeen: 'Online' },
    { name: 'Hope_Walker_34', avatar: getCartoonAvatar(6), isOnline: true, lastSeen: 'Online' },
    { name: 'Gentle_Wind_78', avatar: getCartoonAvatar(7), isOnline: false, lastSeen: '2 hours ago' },
    { name: 'Rising_Phoenix_56', avatar: getCartoonAvatar(8), isOnline: true, lastSeen: 'Online' },
    { name: 'Quiet_Strength_91', avatar: getCartoonAvatar(9), isOnline: false, lastSeen: '30 mins ago' },
    { name: 'Inner_Light_25', avatar: getCartoonAvatar(10), isOnline: true, lastSeen: 'Online' },
];

// Memoize MessageBubble outside component
const MessageBubble = React.memo(({ message, chatType }) => {
    const isUser = message.sender === 'user';

    return (
        <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
            {!isUser && chatType === 'group' && message.avatar && (
                <View style={styles.messageSenderAvatarContainer}>
                    <SvgUri
                        uri={message.avatar}
                        width={28}
                        height={28}
                    />
                </View>
            )}

            <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.otherMessage]}>
                {!isUser && chatType === 'group' && (
                    <Text style={styles.messageSenderName}>{message.senderName}</Text>
                )}
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.otherMessageText]}>
                    {message.text}
                </Text>
                <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.otherMessageTime]}>
                    {message.time}
                </Text>
            </View>
        </View>
    );
});

// Group Info Modal Component
const GroupInfoModal = ({ visible, onClose, chat }) => {
    const navigation = useNavigation();

    const handleLeaveGroup = () => {
        Alert.alert(
            'Leave Group',
            'Are you sure you want to leave this group?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        onClose();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const ParticipantItem = ({ participant }) => (
        <View style={styles.participantItem}>
            <View style={styles.participantAvatar}>
                <SvgUri
                    uri={participant.avatar}
                    width={40}
                    height={40}
                />
            </View>
            <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusDot, 
                        { backgroundColor: participant.isOnline ? '#4CAF50' : '#9CA3AF' }
                    ]} />
                    <Text style={styles.participantStatus}>
                        {participant.isOnline ? 'Online' : `Last seen ${participant.lastSeen}`}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (!chat || chat.type !== 'group') return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Group Info</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Group Details */}
                    <View style={styles.groupSection}>
                        <View style={styles.groupHeader}>
                            <View style={styles.groupAvatarLarge}>
                                <Icon name="group" size={40} color="#6C63FF" />
                            </View>
                            <View style={styles.groupInfo}>
                                <Text style={styles.groupName}>{chat.name}</Text>
                                <Text style={styles.groupId}>Group ID: {chat.id}</Text>
                                <Text style={styles.participantCount}>
                                    {chat.participants || peerData.length} participants
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Participants List */}
                    <View style={styles.participantsSection}>
                        <Text style={styles.sectionTitle}>
                            Participants ({peerData.length})
                        </Text>
                        
                        {/* You (current user) */}
                        <View style={styles.participantItem}>
                            <View style={styles.participantAvatar}>
                                <View style={styles.userAvatarPlaceholder}>
                                    <Text style={styles.userAvatarText}>You</Text>
                                </View>
                            </View>
                            <View style={styles.participantInfo}>
                                <Text style={styles.participantName}>You</Text>
                                <View style={styles.statusContainer}>
                                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                    <Text style={styles.participantStatus}>Online</Text>
                                </View>
                            </View>
                        </View>

                        {/* Other participants */}
                        {peerData.map((participant, index) => (
                            <ParticipantItem key={index} participant={participant} />
                        ))}
                    </View>

                    {/* Leave Group Button */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity 
                            style={styles.leaveButton}
                            onPress={handleLeaveGroup}
                        >
                            <Icon name="exit-to-app" size={20} color="#FF4444" />
                            <Text style={styles.leaveButtonText}>Leave Group</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const ChatScreen = () => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef(null);
    
    // Get chat data and initial messages from route params
    const { chat = {}, messages: initialMessages = [] } = route.params || {};

    // Initialize messages when component mounts
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // Auto scroll to bottom when new messages are added
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const onBack = () => {
        navigation.goBack();
    };

    const onSendMessage = (text) => {
        const newMessage = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            senderName: 'You',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMessage]);

        // Simulate response
        setTimeout(() => {
            const responses = [
                "Thanks for sharing that with us!",
                "I understand how you're feeling.",
                "That's a great point!",
                "We're here to support you.",
                "That sounds really challenging.",
                "You're so brave for sharing that.",
                "I've felt similar before."
            ];

            const randomPeer = peerData[Math.floor(Math.random() * peerData.length)];
            
            const response = {
                id: (Date.now() + 1).toString(),
                text: responses[Math.floor(Math.random() * responses.length)],
                sender: chat.type === 'group' ? 'peer' : 'other',
                senderName: chat.type === 'group' ? randomPeer.name : chat.name,
                avatar: chat.type === 'group' ? randomPeer.avatar : chat.avatar,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, response]);
        }, 1500);
    };

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    const handleHeaderPress = () => {
        if (chat.type === 'group') {
            setShowGroupInfo(true);
        }
    };

    // Memoize header avatar to prevent re-renders
    const HeaderAvatar = useMemo(() => {
        if (chat.type === 'group') {
            return <Icon name="group" size={20} color="#6C63FF" />;
        } else if (chat.avatar) {
            return (
                <View style={styles.headerSvgAvatarContainer}>
                    <SvgUri
                        uri={chat.avatar}
                        width={40}
                        height={40}
                    />
                </View>
            );
        }
        return null;
    }, [chat.type, chat.avatar]);

    // Memoize renderItem function
    const renderItem = useMemo(() => {
        return ({ item }) => <MessageBubble message={item} chatType={chat.type} />;
    }, [chat.type]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Chat Header */}
            <View style={styles.chatScreenHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#6C63FF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.chatHeaderInfo}
                    onPress={handleHeaderPress}
                    activeOpacity={chat.type === 'group' ? 0.7 : 1}
                >
                    <View style={styles.chatHeaderAvatar}>
                        {HeaderAvatar}
                    </View>
                    <View style={styles.chatHeaderText}>
                        <Text style={styles.chatHeaderName}>{chat.name || 'Chat'}</Text>
                        <Text style={styles.chatHeaderStatus}>
                            {chat.type === 'group' ?
                                `${chat.participants || peerData.length} participants` :
                                chat.isOnline ? 'Online' : 'Last seen recently'
                            }
                        </Text>
                    </View>
                    {chat.type === 'group' && (
                        <Icon name="info" size={20} color="#9CA3AF" style={styles.infoIcon} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={[styles.messagesList, { paddingBottom: 90 + insets.bottom }]}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                style={[styles.keyboardAvoidingView, { paddingBottom: insets.bottom }]}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Icon name="send" size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Group Info Modal */}
            <GroupInfoModal 
                visible={showGroupInfo}
                onClose={() => setShowGroupInfo(false)}
                chat={chat}
            />
        </SafeAreaView>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        paddingBottom: 70
    },
    chatScreenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    chatHeaderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chatHeaderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerAvatarText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6C63FF',
    },
    chatHeaderText: {
        flex: 1,
    },
    chatHeaderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
    },
    chatHeaderStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    infoIcon: {
        marginLeft: 8,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesContent: {
        paddingVertical: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageSenderAvatarContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F4FF',
        overflow: 'hidden',
        marginRight: 8,
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    senderAvatarText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 2,
    },
    userMessage: {
        backgroundColor: '#6C63FF',
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    messageSenderName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6C63FF',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#1F2153',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '400',
    },
    userMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: '#9CA3AF',
    },
    keyboardAvoidingView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F4FF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F8FAFF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#1F2153',
        maxHeight: 100,
        paddingVertical: 8,
        textAlignVertical: 'top',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    headerSvgAvatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    groupSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        marginBottom: 16,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    groupAvatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 4,
    },
    groupId: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    participantCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    participantsSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 16,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFF',
    },
    participantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        overflow: 'hidden',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    participantInfo: {
        flex: 1,
    },
    participantName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 2,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    participantStatus: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    leaveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    leaveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF4444',
        marginLeft: 8,
    },
});