import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';
import { BSON } from 'bson';

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
            console.log("Messages", data)
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
            console.log("Chats", data)
            if (data.success) {
                const mappedChats = data.data.map(chat => ({
                    ...chat,
                    name: chat.participant.annonymousUsername || 'Unknown',
                    avatar: chat.participant.avatar,
                    lastMessage: chat.lastMessage?.text,
                    lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
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
        
        const bsonId = new BSON.ObjectId().toString();
        console.log(bsonId)
        const newMessage = {
            _id: bsonId,
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
                messageId: bsonId,
                message: text,
                senderId: currentUser._id,
                receiverId: receiverId,
                chatId: chatId,
                timestamp: newMessage.timestamp
            });
        }
    }, [currentUser, socket]);

    const markMessagesAsSeen = useCallback((chatId, receiverId, messageIds) => {
        if (socket && currentUser && messageIds && messageIds.length > 0) {
            socket.emit('seenMessages', {
                userId: currentUser._id,
                chatId,
                receiverId,
                messageIds
            });

            // Optimistically mark as seen locally
            setPeerMessages(prev => {
                const messages = prev[chatId] || [];
                const updated = messages.map(msg => {
                    if (messageIds.includes(msg._id) && msg.sender !== currentUser._id && (!msg.readBy || !msg.readBy.includes(currentUser._id))) {
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

    const startChat = useCallback(async (peerId) => {
        if (!currentUser) return null;
        try {
            const res = await fetch(`${BASE_URL}/api/v1/peer-chat/create/${peerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`,
                },
            });
            const data = await res.json();
            console.log(data);
            if (data.success) {
                const newChat = {
                    ...data.data,
                    unreadCount: 0,
                    lastMessage: null,
                    type: 'peer'
                };
                
                setPeerChats(prev => {
                    if (prev.find(c => c._id === newChat._id)) return prev;
                    const updated = [newChat, ...prev];
                    AsyncStorage.setItem('peer_chats', JSON.stringify(updated));
                    return updated;
                });
                return newChat;
            }
        } catch (error) {
            console.error("Failed to create chat", error);
        }
        return null;
    }, [currentUser]);

    const deleteChat = useCallback(async (chatId) => {
        if (!currentUser) return;
        
        setPeerChats(prev => {
            const updated = prev.filter(c => c._id !== chatId);
            AsyncStorage.setItem('peer_chats', JSON.stringify(updated));
            return updated;
        });
        
        try {
            await fetch(`${BASE_URL}/api/v1/peer-chat/delete/${chatId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
        } catch (err) {
            console.error("Error deleting chat", err);
        }
    }, [currentUser]);

    const clearChat = useCallback(async (chatId) => {
        if (!currentUser) return;
        
        setPeerMessages(prev => ({ ...prev, [chatId]: [] }));
        AsyncStorage.removeItem(`chat_messages_${chatId}`);
        
        try {
            await fetch(`${BASE_URL}/api/v1/peer-message/clear/${chatId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
        } catch (err) {
            console.error("Error clearing chat", err);
        }
    }, [currentUser]);

    const deleteMessageForMe = useCallback(async (messageId, chatId) => {
        if (!currentUser) return;

        setPeerMessages(prev => {
            const messages = prev[chatId] || [];
            const updated = messages.filter(m => m._id !== messageId);
            AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));

            // Update PeerChats if last message was deleted
            if (messages.length > 0 && messages[0]._id === messageId) {
                setPeerChats(prevChats => {
                    const updatedChats = prevChats.map(chat => {
                        if (chat._id === chatId) {
                            const newLastMsg = updated[0];
                            return {
                                ...chat,
                                lastMessage: newLastMsg ? (newLastMsg.deletedForEveryone ? "This message was deleted" : newLastMsg.text) : '',
                                lastMessageTime: newLastMsg ? newLastMsg.timestamp : chat.updatedAt
                            };
                        }
                        return chat;
                    });
                    AsyncStorage.setItem('peer_chats', JSON.stringify(updatedChats));
                    return updatedChats;
                });
            }

            return { ...prev, [chatId]: updated };
        });

        try {
            const res = await fetch(`${BASE_URL}/api/v1/peer-message/delete/for-me/${messageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            if(!res.ok) {
                console.error(await res.json());
            }
        } catch (err) {
            console.error("Error deleting message for me", err);
        }
    }, [currentUser]);

    const deleteMessageForEveryone = useCallback(async (messageId, chatId, participantId) => {
        if (!currentUser) return;

        setPeerMessages(prev => {
            const messages = prev[chatId] || [];
            const updated = messages.map(m => {
                if (m._id === messageId) {
                    return { ...m, deletedForEveryone: true, text: "This message was deleted" };
                }
                return m;
            });
            AsyncStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(updated));

            // Update PeerChats if last message was deleted
            if (messages.length > 0 && messages[0]._id === messageId) {
                setPeerChats(prevChats => {
                    const updatedChats = prevChats.map(chat => {
                        if (chat._id === chatId) {
                            return {
                                ...chat,
                                lastMessage: "This message was deleted"
                            };
                        }
                        return chat;
                    });
                    AsyncStorage.setItem('peer_chats', JSON.stringify(updatedChats));
                    return updatedChats;
                });
            }

            return { ...prev, [chatId]: updated };
        });

        try {
            await fetch(`${BASE_URL}/api/v1/peer-message/delete/for-everyone/${messageId}?participantId=${participantId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
        } catch (err) {
            console.error("Error deleting message for everyone", err);
        }
    }, [currentUser]);

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
            if (!json.success) {
                console.log(json)
                setCurrentUser(null);
                return;
            }
            const currentUser = { ...json.data, accessToken: token };
            console.log(currentUser.realFullname, currentUser._id)
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
                const { chatId, message, senderId, timestamp, messageId } = data;
                const newMessage = {
                    _id: messageId,
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

            newSocket.on('messageSeen', ({ chatId, messageIds }) => {
                const chats = peerChatsRef.current;
                const chat = chats.find(c => c._id === chatId);
                const otherUserId = chat?.participant?._id;

                if (otherUserId) {
                    setPeerMessages(prev => {
                        const messages = prev[chatId];
                        if (!messages) return prev;

                        const updated = messages.map(msg => {
                            const shouldUpdate = messageIds ? messageIds.includes(msg._id) : true;
                            if (shouldUpdate && msg.sender === currentUser._id && (!msg.readBy || !msg.readBy.includes(otherUserId))) {
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

                            // Update PeerChats if it was the last message
                            if (index === 0) {
                                setPeerChats(prevChats => {
                                    const updatedChats = prevChats.map(chat => {
                                        if (chat._id === chatId) {
                                            return {
                                                ...chat,
                                                lastMessage: "This message was deleted"
                                            };
                                        }
                                        return chat;
                                    });
                                    AsyncStorage.setItem('peer_chats', JSON.stringify(updatedChats));
                                    return updatedChats;
                                });
                            }
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
        setActiveChatId,
        startChat,
        deleteChat,
        clearChat,
        deleteMessageForMe,
        deleteMessageForEveryone
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;