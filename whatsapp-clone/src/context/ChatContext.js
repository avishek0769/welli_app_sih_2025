import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    const addChat = (chat) => {
        setChats((prevChats) => [...prevChats, chat]);
    };

    const selectChat = (chatId) => {
        setActiveChat(chatId);
    };

    const contextValue = {
        chats,
        activeChat,
        addChat,
        selectChat,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};