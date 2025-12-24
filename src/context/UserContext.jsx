import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';

const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => { },
    socket: null,
    socketId: null,
    setSocketId: () => { },
    peerChats: [],
    setPeerChats: () => { },
    activeChatId: null,
    setActiveChatId: () => { },
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [socketId, setSocketId] = useState(null);
    const [peerMessages, setPeerMessages] = useState({});
    const [peerChats, setPeerChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const activeChatIdRef = useRef(null);
    const peerChatsRef = useRef([]);

    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    useEffect(() => {
        peerChatsRef.current = peerChats;
    }, [peerChats]);

    const fetchChatMessages = useCallback(async (chatId) => {
        if (!currentUser) return;
        
        // Load from storage first
        const stored = await AsyncStorage.getItem(`chat_messages_${chatId}`);
        if (stored) {
            setPeerMessages(prev => ({ ...prev, [chatId]: JSON.parse(stored) }));
        }

        // Sync with DB
        try {
            const res = await fetch(`${BASE_URL}/api/v1/peer-message/all/${chatId}`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                const messages = data.data.messages; 
                setPeerMessages(prev => ({ ...prev, [chatId]: messages }));
                await AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(messages));
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    }, [currentUser]);

    const fetchPeerChats = useCallback(async () => {
        if (!currentUser) return;
        
        // Load from storage first
        const stored = await AsyncStorage.getItem('peer_chats');
        if (stored) {
            setPeerChats(JSON.parse(stored));
        }

        try {
            const res = await fetch(`${BASE_URL}/api/v1/peer-chat/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`,
                },
            });
            const data = await res.json();
            
            if (data.success) {
                const mappedChats = data.data.map(chat => ({
                    ...chat,
                    name: chat.participant.annonymousUsername || 'Unknown',
                    avatar: chat.participant.avatar,
                    lastMessage: chat.lastMessage?.text || 'This message was deleted',
                    lastMessageTime: chat.lastMessage?.timestamp,
                    unreadCount: chat.unreadCount || 0,
                    type: 'peer'
                }));
                setPeerChats(mappedChats);
                await AsyncStorage.setItem('peer_chats', JSON.stringify(mappedChats));
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    }, [currentUser]);

    const sendChatMessage = useCallback(async (chatId, text, receiverId) => {
        if (!currentUser) return;
        
        const tempId = Date.now().toString();
        const newMessage = {
            _id: tempId,
            text: text,
            sender: currentUser._id,
            timestamp: new Date().toISOString(),
            deletedForEveryone: false,
        };

        // Optimistic Update
        setPeerMessages(prev => {
            const current = prev[chatId] || [];
            const updated = [newMessage, ...current];
            AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));
            return { ...prev, [chatId]: updated };
        });

        // Update PeerChats Optimistically
        setPeerChats(prev => {
            const updated = prev.map(chat => {
                if (chat._id === chatId) {
                    return {
                        ...chat,
                        lastMessage: text,
                        lastMessageTime: newMessage.timestamp,
                    };
                }
                return chat;
            });
            // Move updated chat to top
            const chatIndex = updated.findIndex(c => c._id === chatId);
            if (chatIndex > 0) {
                const [chat] = updated.splice(chatIndex, 1);
                updated.unshift(chat);
            }
            AsyncStorage.setItem('peer_chats', JSON.stringify(updated));
            return updated;
        });

        if (socket) {
            socket.emit('sendMessage', {
                message: text,
                senderId: currentUser._id,
                receiverId: receiverId,
                chatId: chatId
            });
        }
    }, [currentUser, socket]);

    const markMessagesAsSeen = useCallback((chatId, receiverId) => {
        if (socket && currentUser) {
            socket.emit('seenMessages', {
                userId: currentUser._id,
                chatId,
                receiverId
            });

            // Optimistically mark as seen locally
            setPeerMessages(prev => {
                const messages = prev[chatId] || [];
                const updated = messages.map(msg => {
                    if (msg.sender !== currentUser._id && (!msg.readBy || !msg.readBy.includes(currentUser._id))) {
                        return { ...msg, readBy: [...(msg.readBy || []), currentUser._id] };
                    }
                    return msg;
                });
                AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));
                return { ...prev, [chatId]: updated };
            });

            // Update PeerChats unread count
            setPeerChats(prev => {
                const updated = prev.map(chat => {
                    if (chat._id === chatId) {
                        return { ...chat, unreadCount: 0 };
                    }
                    return chat;
                });
                AsyncStorage.setItem('peer_chats', JSON.stringify(updated));
                return updated;
            });
        }
    }, [socket, currentUser]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const tokenExp = await AsyncStorage.getItem('accessTokenExp');
            if (!token || (tokenExp && new Date(tokenExp) <= new Date())) {
                refreshTokens();
                return;
            }
            const res = await fetch(`${BASE_URL}/api/v1/user/current`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 452) {
                refreshTokens();
                return;
            }
            const json = await res.json();
            const currentUser = { ...json.data, accessToken: token };
            setCurrentUser(currentUser);
        }
        catch (err) {
            setCurrentUser(null);
        }
    }, []);

    const updateOnlineStatus = async (isActive, status) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            await fetch(`${BASE_URL}/api/v1/user/online?isActive=${isActive}&status=${status}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    };

    const refreshTokens = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const refreshTokenExp = await AsyncStorage.getItem('refreshTokenExp');

            if (!refreshToken || (refreshTokenExp && new Date(refreshTokenExp) <= new Date())) {
                return;
            }

            const res = await fetch(`${BASE_URL}/api/v1/user/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                return;
            }

            const json = await res.json();
            
            await AsyncStorage.setItem('accessToken', json.data.accessToken);
            await AsyncStorage.setItem('refreshToken', json.data.refreshToken);
            fetchCurrentUser();
        }
        catch (error) {
            console.error('Failed to refresh tokens:', error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchPeerChats();
        }
    }, [currentUser, fetchPeerChats]);

    useEffect(() => {
        fetchCurrentUser();
        updateOnlineStatus(true);

        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === "active") {
                updateOnlineStatus(true, nextAppState);
            }
            else {
                updateOnlineStatus(false, nextAppState);
            }
        });

        return () => {
            subscription.remove()
        }
    }, [fetchCurrentUser]);

    useEffect(() => {
        if (currentUser && !socket) {
            const newSocket = io(BASE_URL);
            
            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setSocketId(newSocket.id);
                
                if (currentUser.accessToken) {
                    fetch(`${BASE_URL}/api/v1/user/online?isActive=true&socketId=${newSocket.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${currentUser.accessToken}`,
                        },
                    }).catch(err => console.error("Failed to update socket status", err));
                }
            });

            // Global Message Listeners
            newSocket.on('newMessage', (data) => {
                const { chatId, message, senderId, timestamp } = data;
                const newMessage = {
                    _id: Date.now().toString(),
                    text: message,
                    sender: senderId,
                    timestamp: timestamp || new Date().toISOString(),
                    deletedForEveryone: false
                };
                
                setPeerMessages(prev => {
                    const current = prev[chatId] || [];
                    if (current.some(m => m._id === newMessage._id)) return prev;
                    
                    const updated = [newMessage, ...current];
                    AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));
                    return { ...prev, [chatId]: updated };
                });

                setPeerChats(prev => {
                    const updated = prev.map(chat => {
                        if (chat._id === chatId) {
                            const isChatActive = activeChatIdRef.current === chatId;
                            return {
                                ...chat,
                                lastMessage: message,
                                lastMessageTime: timestamp,
                                unreadCount: isChatActive ? 0 : (chat.unreadCount || 0) + 1
                            };
                        }
                        return chat;
                    });
                    
                    const chatIndex = updated.findIndex(c => c._id === chatId);
                    if (chatIndex > 0) {
                        const [chat] = updated.splice(chatIndex, 1);
                        updated.unshift(chat);
                    }
                    
                    AsyncStorage.setItem('peer_chats', JSON.stringify(updated));
                    return updated;
                });
            });

            newSocket.on('messageSeen', ({ chatId }) => {
                const chats = peerChatsRef.current;
                const chat = chats.find(c => c._id === chatId);
                const otherUserId = chat?.participant?._id;

                if (otherUserId) {
                    setPeerMessages(prev => {
                        const messages = prev[chatId];
                        if (!messages) return prev;

                        const updated = messages.map(msg => {
                            if (msg.sender === currentUser._id && (!msg.readBy || !msg.readBy.includes(otherUserId))) {
                                return { ...msg, readBy: [...(msg.readBy || []), otherUserId] };
                            }
                            return msg;
                        });
                        AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));
                        return { ...prev, [chatId]: updated };
                    });
                }
            });

            newSocket.on('messageDltForEv', (messageId) => {
                setPeerMessages(prev => {
                    let updated = false;
                    const newState = { ...prev };
                    
                    Object.keys(newState).forEach(chatId => {
                        const msgs = newState[chatId];
                        const index = msgs.findIndex(m => m._id === messageId);
                        if (index !== -1) {
                            const newMsgs = [...msgs];
                            newMsgs[index] = { ...newMsgs[index], deletedForEveryone: true, text: "This message was deleted" };
                            newState[chatId] = newMsgs;
                            AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(newMsgs));
                            updated = true;
                        }
                    });
                    
                    return updated ? newState : prev;
                });
            });

            setSocket(newSocket);

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setSocketId(null);
            });
            
            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [currentUser]);

    const value = {
        currentUser,
        setCurrentUser,
        socket,
        socketId,
        setSocketId,
        peerMessages,
        fetchChatMessages,
        sendChatMessage,
        markMessagesAsSeen,
        peerChats,
        fetchPeerChats,
        setActiveChatId
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;