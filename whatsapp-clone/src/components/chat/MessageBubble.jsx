import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const MessageBubble = ({ message, sender, timestamp }) => {
    const isUser = sender === 'user';

    return (
        <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.peerMessageContainer]}>
            <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.peerMessage]}>
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.peerMessageText]}>
                    {message}
                </Text>
                <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.peerMessageTime]}>
                    {timestamp}
                </Text>
            </View>
        </View>
    );
};

MessageBubble.propTypes = {
    message: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 6,
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    peerMessageContainer: {
        justifyContent: 'flex-start',
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
    peerMessage: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    peerMessageText: {
        color: '#1F2153',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: '400',
    },
    userMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    peerMessageTime: {
        color: '#9CA3AF',
    },
});

export default MessageBubble;