import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator,
    Alert,
    Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { BASE_URL } from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { BSON } from 'bson';
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const { width, height } = Dimensions.get('window');

const ConversationItem = ({ conversation, onPress, onLongPress, isActive }) => {
    return (
        <TouchableOpacity 
            style={[styles.conversationItem, isActive && styles.activeConversation]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.conversationIcon}>
                <Icon name="chat-bubble-outline" size={16} color="#6C63FF" />
            </View>
            <View style={styles.conversationContent}>
                <Text style={styles.conversationTitle} numberOfLines={1}>
                    {conversation.title}
                </Text>
                <Text style={styles.conversationTime}>
                    {conversation.timestamp}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    const { currentUser } = useUser();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const soundRef = useRef(null);

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.release();
            }
        };
    }, []);

    const playAudio = async () => {
        if (isPlaying) {
            soundRef.current?.stop();
            setIsPlaying(false);
            return;
        }

        if (soundRef.current) {
            soundRef.current.play((success) => {
                setIsPlaying(false);
            });
            setIsPlaying(true);
            return;
        }

        setIsLoadingAudio(true);
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-message/audio/${message.id}`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await response.json();
            
            if (data.success && data.data.audioUrl) {
                const sound = new Sound(data.data.audioUrl, null, (error) => {
                    if (error) {
                        console.log('failed to load the sound', error);
                        setIsLoadingAudio(false);
                        return;
                    }
                    setIsPlaying(true);
                    sound.play((success) => {
                        setIsPlaying(false);
                    });
                });
                soundRef.current = sound;
            }
        } catch (error) {
            console.error("Error playing audio", error);
            Alert.alert("Error", "Failed to play audio");
        } finally {
            setIsLoadingAudio(false);
        }
    };
    
    return (
        <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
            {!isUser && (
                <View style={styles.botAvatar}>
                    <Icon name="smart-toy" size={16} color="#6C63FF" />
                </View>
            )}
            <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.botMessage]}>
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>
                    {message.text}
                </Text>
                {!isUser && message.id && (
                    <View style={styles.audioContainer}>
                        <TouchableOpacity 
                            onPress={playAudio} 
                            style={styles.audioButton}
                            disabled={isLoadingAudio}
                        >
                            {isLoadingAudio ? (
                                <ActivityIndicator size="small" color="#6C63FF" />
                            ) : (
                                <Icon name={isPlaying ? "stop" : "volume-up"} size={20} color="#6C63FF" />
                            )}
                            <Text style={styles.audioText}>
                                {isLoadingAudio ? "Loading..." : (isPlaying ? "Stop" : "Listen")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.botMessageTime]}>
                    {message.time}
                </Text>
            </View>
        </View>
    );
};

const ChatMessageItem = ({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
        <View>
            <MessageBubble 
                message={{ 
                    text: item.promptText, 
                    sender: 'user', 
                    time: time 
                }} 
            />
            {item.responseText && (
                <MessageBubble 
                    message={{ 
                        id: item._id,
                        text: item.responseText, 
                        sender: 'bot', 
                        time: time 
                    }} 
                />
            )}
        </View>
    );
};

export default function Chatbot() {
    const { currentUser } = useUser();
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [inputText, setInputText] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingConversation, setEditingConversation] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    const flatListRef = useRef(null);
    const sidebarAnimation = useRef(new Animated.Value(-250)).current;
    const isPaginationRef = useRef(false);

    useEffect(() => {
        loadInitialData();
        fetchConversations();
    }, []);

    const loadInitialData = async () => {
        try {
            const storedChatId = await AsyncStorage.getItem('chatbot_latest_chatId');
            const storedMessages = await AsyncStorage.getItem('chatbot_latest_messages');

            if (storedChatId && storedMessages) {
                setActiveConversationId(storedChatId);
                setMessages(JSON.parse(storedMessages));
            } else {
                fetchLatestChat();
            }
        } catch (error) {
            console.error("Error loading initial data", error);
            fetchLatestChat();
        }
    };

    const fetchConversations = async () => {
        if (!currentUser) return;
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-conversation?page=0&limit=20`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error("Error fetching conversations", error);
        }
    };

    const fetchLatestChat = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-conversation/latest`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await response.json();
            if (data.success && data.data.chat) {
                const chatId = data.data.chat._id;
                setActiveConversationId(chatId);
                await AsyncStorage.setItem('chatbot_latest_chatId', chatId);
                
                // Fetch latest messages for this chat using the message endpoint
                const msgResponse = await fetch(`${BASE_URL}/api/v1/chatbot-message/${chatId}?page=0&limit=20`, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                const msgData = await msgResponse.json();
                if (msgData.success) {
                    const sortedMessages = msgData.data.reverse();
                    setMessages(sortedMessages);
                    await AsyncStorage.setItem('chatbot_latest_messages', JSON.stringify(sortedMessages));
                }
            }
        } catch (error) {
            console.error("Error fetching latest chat", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
        Animated.timing(sidebarAnimation, {
            toValue: sidebarVisible ? -250 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isSending) return;

        const text = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Generate ObjectId
        const messageId = new BSON.ObjectId().toString();
        const timestamp = new Date().toISOString();

        // Optimistic update with combined object
        const newMessage = {
            _id: messageId,
            promptText: text,
            responseText: null, // Loading state
            timestamp: timestamp
        };
        
        setMessages(prev => [...prev, newMessage]);

        try {
            let currentChatId = activeConversationId;
            
            if (!currentChatId || typeof currentChatId !== 'string') {
                const createRes = await fetch(`${BASE_URL}/api/v1/chatbot-conversation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.accessToken}`
                    },
                    body: JSON.stringify({ title: text.substring(0, 20) || "New Chat" })
                });
                const createData = await createRes.json();

                if (createData.success && createData.data?._id) {
                    currentChatId = createData.data._id;
                    setActiveConversationId(currentChatId);
                    await AsyncStorage.setItem('chatbot_latest_chatId', currentChatId);
                    fetchConversations(); // Refresh sidebar 
                }
                else {
                    throw new Error("Failed to create conversation");
                }
            }

            const response = await fetch(`${BASE_URL}/api/v1/chatbot-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`
                },
                body: JSON.stringify({ 
                    userInput: text, 
                    chatId: currentChatId,
                    _id: messageId 
                })
            });
            
            const data = await response.json();
            console.log(data)
            if (data.success) {
                const msg = data.data;
                
                setMessages(prev => {
                    const newMessages = prev.map(m => 
                        m._id === messageId ? msg : m
                    );
                    AsyncStorage.setItem('chatbot_latest_messages', JSON.stringify(newMessages));
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message", error);
            Alert.alert("Error", "Failed to send message");
            // Remove the optimistic message on error
            setMessages(prev => prev.filter(m => m._id !== messageId));
        } finally {
            setIsSending(false);
        }
    };

    const selectConversation = async (conversationId) => {
        setActiveConversationId(conversationId);
        setSidebarVisible(false);
        Animated.timing(sidebarAnimation, {
            toValue: -250,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
        setIsLoading(true);
        setPage(0);
        setHasMore(true);
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-message/${conversationId}?page=0&limit=20`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await response.json();
            if (data.success) {
                // The API returns messages sorted by timestamp -1 (newest first)
                // We need to reverse them to show oldest first
                const sortedMessages = data.data.reverse();
                setMessages(sortedMessages);
            }
        } catch (error) {
            console.error("Error fetching conversation messages", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMoreMessages = async () => {
        if (!activeConversationId || !hasMore || loadingMore) return;
        
        setLoadingMore(true);
        const nextPage = page + 1;
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-message/${activeConversationId}?page=${nextPage}&limit=20`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await response.json();
            if (data.success) {
                const newMessages = data.data;
                if (newMessages.length === 0) {
                    setHasMore(false);
                } else {
                    // newMessages are newest first (descending).
                    // We want to prepend them to the TOP of the list (which is the oldest part).
                    // So we reverse them to get oldest -> newest of that chunk.
                    const sortedNewMessages = newMessages.reverse();
                    
                    isPaginationRef.current = true;
                    setMessages(prev => [...sortedNewMessages, ...prev]);
                    setPage(nextPage);
                }
            }
        } catch (error) {
            console.error("Error fetching more messages", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY <= 0 && !loadingMore && hasMore && messages.length > 0) {
            fetchMoreMessages();
        }
    };

    const startNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        setSidebarVisible(false);
        Animated.timing(sidebarAnimation, {
            toValue: -250,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleLongPress = (conversation) => {
        Alert.alert(
            "Conversation Options",
            "Choose an action",
            [
                {
                    text: "Edit Title",
                    onPress: () => {
                        setEditingConversation(conversation);
                        setNewTitle(conversation.title);
                        setEditModalVisible(true);
                    }
                },
                {
                    text: "Delete Conversation",
                    onPress: () => {
                        Alert.alert(
                            "Delete Conversation",
                            "Are you sure you want to delete this conversation?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { 
                                    text: "Delete", 
                                    style: "destructive",
                                    onPress: () => deleteConversation(conversation._id)
                                }
                            ]
                        );
                    },
                    style: "destructive"
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const deleteConversation = async (chatId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-conversation/${chatId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            
            if (response.ok) {
                setConversations(prev => prev.filter(c => c._id !== chatId));
                if (activeConversationId === chatId) {
                    startNewChat();
                }
                Alert.alert("Success", "Conversation deleted");
            }
        } catch (error) {
            console.error("Error deleting conversation", error);
            Alert.alert("Error", "Failed to delete conversation");
        }
    };

    const updateConversationTitle = async () => {
        if (!editingConversation || !newTitle.trim()) return;
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/chatbot-conversation/${editingConversation._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}` 
                },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (response.ok) {
                setConversations(prev => prev.map(c => 
                    c._id === editingConversation._id ? { ...c, title: newTitle } : c
                ));
                setEditModalVisible(false);
                setEditingConversation(null);
                setNewTitle('');
            }
        } catch (error) {
            console.error("Error updating title", error);
            Alert.alert("Error", "Failed to update title");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <Header /> */}
            
            <View style={styles.mainContent}>
                {/* Sidebar */}
                <Animated.View style={[
                    styles.sidebar,
                    { transform: [{ translateX: sidebarAnimation }] }
                ]}>
                    <View style={styles.sidebarHeader}>
                        <Text style={styles.sidebarTitle}>Chat History</Text>
                        <TouchableOpacity onPress={toggleSidebar} style={styles.closeSidebar}>
                            <Icon name="close" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={conversations}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <ConversationItem
                                conversation={item}
                                isActive={activeConversationId === item._id}
                                onPress={() => selectConversation(item._id)}
                                onLongPress={() => handleLongPress(item)}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </Animated.View>

                {/* Chat Area */}
                <View style={styles.chatArea}>
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={toggleSidebar} style={styles.menuToggle}>
                            <Icon name="menu" size={24} color="#6C63FF" />
                        </TouchableOpacity>
                        <Text style={styles.chatTitle}>Chat with Welli</Text>
                        <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
                            <Icon name="add" size={20} color="#6C63FF" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#6C63FF" />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => <ChatMessageItem item={item} />}
                            style={styles.messagesList}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            ListHeaderComponent={loadingMore ? <ActivityIndicator size="small" color="#6C63FF" /> : null}
                        />
                    )}
                    
                    {isSending && (
                        <View style={{ padding: 10, marginLeft: 16 }}>
                            <Text style={{ color: '#6B7280', fontStyle: 'italic' }}>Welli is typing...</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={{ marginBottom: 55 }}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your message..."
                            placeholderTextColor="#9CA3AF"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isSending}
                        >
                            <Icon name="send" size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Edit Title Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Conversation Title</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            placeholder="Enter new title"
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={updateConversationTitle}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appLogo: {
        marginRight: 12,
    },
    logoGradient: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    chatbotInfo: {
        flex: 1,
    },
    chatbotName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2153',
        letterSpacing: 0.3,
    },
    chatbotStatus: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 2,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        position: 'relative',
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: -90,
        width: 250,
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        borderRightWidth: 1,
        borderRightColor: '#E8F0FF',
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 44,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    sidebarTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2153',
    },
    closeSidebar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 12,
    },
    activeConversation: {
        backgroundColor: '#F0F4FF',
    },
    conversationIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8FAFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    conversationContent: {
        flex: 1,
    },
    conversationTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 2,
    },
    conversationTime: {
        fontSize: 11,
        color: '#6B7280',
    },
    chatArea: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    menuToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
        textAlign: 'center',
    },
    newChatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
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
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 4,
    },
    messageBubble: {
        maxWidth: width * 0.7,
        padding: 12,
        borderRadius: 18,
        marginVertical: 2,
    },
    userMessage: {
        backgroundColor: '#6C63FF',
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
    },
    botMessage: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#F0F4FF',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    botMessageText: {
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
    botMessageTime: {
        color: '#9CA3AF',
    },
    audioContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    audioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    audioText: {
        fontSize: 12,
        color: '#6C63FF',
        marginLeft: 6,
        fontWeight: '600',
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F4FF',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F2153',
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E8F0FF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        color: '#1F2153',
        backgroundColor: '#F8FAFF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#6C63FF',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});