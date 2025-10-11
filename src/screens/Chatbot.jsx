import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

/* ---------- Header Component ---------- */
const ChatHeader = () => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.appLogo}>
                    <View style={styles.logoGradient}>
                        <Icon name="psychology" size={26} color="#FFFFFF" />
                    </View>
                </View>
                <View style={styles.chatbotInfo}>
                    <Text style={styles.chatbotName}>Welli Assistant</Text>
                    <Text style={styles.chatbotStatus}>AI Mental Health Companion</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.8}>
                <Icon name="more-vert" size={24} color="#6C63FF" />
            </TouchableOpacity>
        </View>
    );
};

/* ---------- Conversation Item Component ---------- */
const ConversationItem = ({ conversation, onPress, isActive }) => {
    return (
        <TouchableOpacity 
            style={[styles.conversationItem, isActive && styles.activeConversation]}
            onPress={onPress}
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

/* ---------- Message Component ---------- */
const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    
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
                <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.botMessageTime]}>
                    {message.time}
                </Text>
            </View>
        </View>
    );
};

/* ---------- Main Chatbot Component ---------- */
export default function Chatbot() {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hello! I\'m your Welli Assistant. I\'m here to support your mental wellbeing. How are you feeling today?',
            sender: 'bot',
            time: '10:30 AM'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [activeConversation, setActiveConversation] = useState(0);
    const flatListRef = useRef(null);
    const sidebarAnimation = useRef(new Animated.Value(-250)).current;

    // Mock conversation history
    const conversations = [
        { id: 0, title: 'Feeling anxious about work', timestamp: '2 hours ago' },
        { id: 1, title: 'Sleep problems discussion', timestamp: 'Yesterday' },
        { id: 2, title: 'Stress management tips', timestamp: '2 days ago' },
        { id: 3, title: 'Morning motivation chat', timestamp: '1 week ago' },
    ];

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
        Animated.timing(sidebarAnimation, {
            toValue: sidebarVisible ? -250 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const sendMessage = () => {
        if (inputText.trim()) {
            const newUserMessage = {
                id: Date.now().toString(),
                text: inputText.trim(),
                sender: 'user',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, newUserMessage]);
            setInputText('');

            // Simulate bot response
            setTimeout(() => {
                const botResponse = {
                    id: (Date.now() + 1).toString(),
                    text: getBotResponse(newUserMessage.text),
                    sender: 'bot',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botResponse]);
            }, 1000);
        }
    };

    const getBotResponse = (userMessage) => {
        const responses = [
            "I understand how you're feeling. It's completely normal to experience these emotions.",
            "Thank you for sharing that with me. Can you tell me more about what's been bothering you?",
            "That sounds challenging. Have you tried any relaxation techniques like deep breathing?",
            "I'm here to listen. Remember that taking care of your mental health is important.",
            "It's great that you're reaching out. What would you like to work on today?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const selectConversation = (conversationId) => {
        setActiveConversation(conversationId);
        setSidebarVisible(false);
        Animated.timing(sidebarAnimation, {
            toValue: -250,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
        // Load conversation messages (mock implementation)
        setMessages([
            {
                id: '1',
                text: 'Hello! Welcome back. How can I help you today?',
                sender: 'bot',
                time: '10:30 AM'
            }
        ]);
    };

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            {/* <ChatHeader /> */}
            
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
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ConversationItem
                                conversation={item}
                                isActive={activeConversation === item.id}
                                onPress={() => selectConversation(item.id)}
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
                        <TouchableOpacity style={styles.newChatButton}>
                            <Icon name="add" size={20} color="#6C63FF" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MessageBubble message={item} />}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                            onPress={sendMessage}
                            disabled={!inputText.trim()}
                        >
                            <Icon name="send" size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
});