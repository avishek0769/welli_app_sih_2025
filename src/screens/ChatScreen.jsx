import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../constants';
import { useUser } from '../context/UserContext';

// Memoize MessageBubble outside component
const MessageBubble = React.memo(({ message, chatType, onLongPress }) => {
    const isUser = message.sender === 'user';
    const isDeleted = message.deletedForEveryone;

    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={() => onLongPress(message)}
            style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}
        >
            {!isUser && chatType === 'group' && message.avatar && (
                <View style={styles.messageSenderAvatarContainer}>
                    {message.avatar ? (
                        <Image
                            source={{ uri: message.avatar }}
                            style={{ width: 28, height: 28, borderRadius: 14 }}
                        />
                    ) : (
                        <Icon name="person" size={28} color="#6C63FF" />
                    )}
                </View>
            )}

            <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.otherMessage]}>
                {!isUser && chatType === 'group' && (
                    <Text style={styles.messageSenderName}>{message.senderName}</Text>
                )}
                <Text style={[
                    styles.messageText, 
                    isUser ? styles.userMessageText : styles.otherMessageText,
                    isDeleted && { fontStyle: 'italic', color: isUser ? '#E0E7FF' : '#9CA3AF' }
                ]}>
                    {message.text}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                    <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.otherMessageTime]}>
                        {message.time}
                    </Text>
                    {isUser && !isDeleted && (
                        <Icon 
                            name="done-all" 
                            size={16} 
                            color={message.isSeen ? "#34B7F1" : "#E0E7FF"} 
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    const pMsg = prevProps.message;
    const nMsg = nextProps.message;
    
    return (
        prevProps.chatType === nextProps.chatType &&
        prevProps.onLongPress === nextProps.onLongPress &&
        pMsg.id === nMsg.id &&
        pMsg.text === nMsg.text &&
        pMsg.isSeen === nMsg.isSeen &&
        pMsg.deletedForEveryone === nMsg.deletedForEveryone &&
        pMsg.time === nMsg.time &&
        pMsg.sender === nMsg.sender &&
        pMsg.avatar === nMsg.avatar
    );
});

// Group Info Modal Component
const GroupInfoModal = ({ visible, onClose, chat, token }) => {
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
                    onPress: async () => {
                        const res = await fetch(`${BASE_URL}/api/v1/peer-chat/delete/${chat._id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        if (!res.ok) {
                            Alert.alert('Error', 'Failed to leave the group. Please try again.');
                            return;
                        }
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
                {participant.avatar ? (
                    <Image
                        source={{ uri: participant.avatar }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                ) : (
                    <Icon name="person" size={40} color="#6C63FF" />
                )}
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
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef(null);
    const processedMessageIds = useRef(new Set());
    const { 
        currentUser, 
        peerMessages, 
        fetchChatMessages, 
        loadMoreMessages,
        sendChatMessage, 
        markMessagesAsSeen, 
        setActiveChatId,
        deleteChat,
        clearChat,
        deleteMessageForMe,
        deleteMessageForEveryone
    } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [page, setPage] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const isLoadingMoreRef = useRef(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    
    // Get chat data and initial messages from route params
    const { chat = {} } = route.params || {};

    // Set active chat ID
    useEffect(() => {
        if (chat._id) {
            setActiveChatId(chat._id);
            processedMessageIds.current.clear();
            setPage(0);
            setHasMoreMessages(true);
            return () => setActiveChatId(null);
        }
    }, [chat._id, setActiveChatId]);

    const handleLoadMore = async () => {
        if (isLoadingMoreRef.current || !hasMoreMessages) return;

        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const newMessagesCount = await loadMoreMessages(chat._id, nextPage);
            
            if (newMessagesCount > 0) {
                setPage(nextPage);
            } else {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    };

    // Fetch messages on mount
    useEffect(() => {
        if (chat._id) {
            fetchChatMessages(chat._id);
        }
    }, [chat._id, fetchChatMessages]);

    // Mark as seen when chat opens or new messages arrive
    useEffect(() => {
        if (chat._id && peerMessages[chat._id]) {
            const messages = peerMessages[chat._id];
            const unreadMessages = messages.filter(msg => 
                msg._id &&
                msg.sender !== currentUser._id && 
                (!msg.readBy || !msg.readBy.includes(currentUser._id)) &&
                !processedMessageIds.current.has(msg._id)
            );

            if (unreadMessages.length > 0) {
                const receiverId = chat.participant?._id;
                if (receiverId) {
                    const unreadMessageIds = unreadMessages.map(m => m._id);
                    unreadMessageIds.forEach(id => processedMessageIds.current.add(id));
                    markMessagesAsSeen(chat._id, receiverId, unreadMessageIds);
                }
            }
        }
    }, [chat._id, markMessagesAsSeen, peerMessages, currentUser._id]);

    // Format messages for display
    const messages = useMemo(() => {
        const raw = peerMessages[chat._id] || [];
        return raw
            .filter(msg => !msg.deletedFor?.includes(currentUser._id))
            .map(msg => {
                const otherUserId = chat.participant?._id;
                const isSeen = msg.readBy && otherUserId && msg.readBy.includes(otherUserId);
                
                return {
                    id: msg._id,
                    text: msg.text,
                    sender: msg.sender === currentUser._id ? 'user' : 'other',
                    senderName: msg.sender === currentUser._id ? 'You' : chat.name,
                    time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    avatar: msg.sender === currentUser._id ? null : chat.avatar,
                    deletedForEveryone: msg.deletedForEveryone,
                    isSeen: isSeen
                };
            });
    }, [peerMessages, chat._id, currentUser, chat.name, chat.avatar, chat.participant]);
    

    const onBack = () => {
        navigation.goBack();
    };

    const onSendMessage = (text) => {
        const receiverId = chat.participant._id;
        if (receiverId) {
            sendChatMessage(chat._id, text, receiverId);
        } else {
            console.error("Receiver ID not found");
        }
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

    const handleDeleteChat = () => {
        Alert.alert(
            "Delete Conversation",
            "Are you sure you want to delete this conversation?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        await deleteChat(chat._id);
                        navigation.goBack();
                    }
                }
            ]
        );
        setShowMenu(false);
    };

    const handleClearChat = () => {
        Alert.alert(
            "Clear Chat",
            "Are you sure you want to clear all messages?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear", 
                    style: "destructive",
                    onPress: async () => {
                        await clearChat(chat._id);
                    }
                }
            ]
        );
        setShowMenu(false);
    };

    const handleMessageLongPress = useCallback((message) => {
        setSelectedMessage(message);
    }, []);

    const handleDeleteMessage = (type) => {
        if (!selectedMessage) return;

        if (type === 'me') {
            deleteMessageForMe(selectedMessage.id, chat._id);
        } else if (type === 'everyone') {
            deleteMessageForEveryone(selectedMessage.id, chat._id, chat.participant?._id);
        }
        setSelectedMessage(null);
    };

    // Memoize header avatar to prevent re-renders
    const HeaderAvatar = useMemo(() => {
        if (chat.type === 'group') {
            return <Icon name="group" size={20} color="#6C63FF" />;
        } else if (chat.avatar) {
            return (
                <View style={styles.headerSvgAvatarContainer}>
                    {chat.avatar ? (
                        <Image
                            source={{ uri: chat.avatar }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                    ) : (
                        <Icon name="person" size={40} color="#6C63FF" />
                    )}
                </View>
            );
        }
        return null;
    }, [chat.type, chat.avatar]);

    // Memoize renderItem function
    const renderItem = useMemo(() => {
        return ({ item }) => <MessageBubble message={item} chatType={chat.type} onLongPress={handleMessageLongPress} />;
    }, [chat.type, handleMessageLongPress]);

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

                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => setShowMenu(true)}
                >
                    <Icon name="more-vert" size={24} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            {/* Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    activeOpacity={1} 
                    onPress={() => setShowMenu(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
                            <Icon name="cleaning-services" size={20} color="#6C63FF" />
                            <Text style={styles.menuText}>Clear Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteChat}>
                            <Icon name="delete" size={20} color="#FF4444" />
                            <Text style={[styles.menuText, { color: '#FF4444' }]}>Delete Conversation</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Message Options Modal */}
            <Modal
                visible={!!selectedMessage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedMessage(null)}
            >
                <TouchableOpacity 
                    style={styles.menuOverlay} 
                    activeOpacity={1} 
                    onPress={() => setSelectedMessage(null)}
                >
                    <View style={styles.messageOptionsContainer}>
                        <Text style={styles.messageOptionsTitle}>Message Options</Text>
                        
                        <TouchableOpacity 
                            style={styles.messageOptionItem} 
                            onPress={() => handleDeleteMessage('me')}
                        >
                            <Icon name="delete" size={20} color="#6C63FF" />
                            <Text style={styles.messageOptionText}>Delete for me</Text>
                        </TouchableOpacity>

                        {selectedMessage?.sender === 'user' && (
                            <TouchableOpacity 
                                style={styles.messageOptionItem} 
                                onPress={() => handleDeleteMessage('everyone')}
                            >
                                <Icon name="delete-forever" size={20} color="#FF4444" />
                                <Text style={[styles.messageOptionText, { color: '#FF4444' }]}>Delete for everyone</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderItem}
                style={[styles.messagesList, { paddingBottom: 90 + insets.bottom }]}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={15}
                inverted
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={isLoadingMore ? (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator size="small" color="#6C63FF" />
                    </View>
                ) : null}
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
                token={currentUser.accessToken}
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
    menuButton: {
        padding: 8,
        marginRight: -8,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 180,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2153',
    },
    messageOptionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        width: '80%',
        maxWidth: 300,
    },
    messageOptionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 16,
        textAlign: 'center',
    },
    messageOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    messageOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2153',
    },

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