import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserProfileModal from './UserProfileModal';

const CommentsModal = ({ visible, post, onClose, onAddComment, onLikeComment }) => {
    const [commentText, setCommentText] = useState('');
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    if (!post) return null;

    const handleSendComment = () => {
        if (commentText.trim()) {
            onAddComment(post.id, commentText.trim());
            setCommentText('');
        }
    };

    const handleUserPress = (user) => {
        // Don't show profile for current user
        if (user.username === 'You') return;
        setSelectedUser(user);
        setShowUserProfile(true);
    };

    const formatLikes = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    const CommentItem = ({ comment }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
                <TouchableOpacity 
                    style={styles.commentUserInfo}
                    onPress={() => handleUserPress({
                        username: comment.username,
                        joinDate: 'Joined 2 months ago',
                        postsCount: Math.floor(Math.random() * 30) + 5,
                        supportGiven: Math.floor(Math.random() * 150) + 20,
                        category: 'Support Member',
                    })}
                    activeOpacity={comment.username === 'You' ? 1 : 0.7}
                >
                    <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                            {comment.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.commentDetails}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                        <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.commentContent}>{comment.content}</Text>
            
            <View style={styles.commentActions}>
                <TouchableOpacity
                    style={[styles.commentLikeButton, comment.likedByUser && styles.commentLikedButton]}
                    onPress={() => onLikeComment(post.id, comment.id)}
                    activeOpacity={0.7}
                >
                    <Icon 
                        name={comment.likedByUser ? "favorite" : "favorite-border"} 
                        size={14} 
                        color={comment.likedByUser ? "#FF4081" : "#6B7280"} 
                    />
                    {comment.likes > 0 && (
                        <Text style={[
                            styles.commentLikeText,
                            comment.likedByUser && styles.commentLikedText
                        ]}>
                            {formatLikes(comment.likes)}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView 
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        
                        <Text style={styles.headerTitle}>Comments</Text>
                        
                        <View style={styles.placeholder} />
                    </View>

                    {/* Original Post Preview */}
                    <View style={styles.postPreview}>
                        <View style={styles.postHeader}>
                            <TouchableOpacity 
                                style={styles.userInfo}
                                onPress={() => handleUserPress({
                                    username: post.username,
                                    joinDate: 'Joined 3 months ago',
                                    postsCount: Math.floor(Math.random() * 50) + 10,
                                    supportGiven: Math.floor(Math.random() * 200) + 50,
                                    category: post.category,
                                })}
                                activeOpacity={post.username === 'You' ? 1 : 0.7}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {post.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.userDetails}>
                                    <Text style={styles.username}>{post.username}</Text>
                                    <Text style={styles.timestamp}>{post.timestamp}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryText}>{post.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.postContent} numberOfLines={3}>
                            {post.content}
                        </Text>
                        <View style={styles.postStats}>
                            <Text style={styles.postStatsText}>
                                {post.likes} likes • {post.comments} comments
                            </Text>
                        </View>
                    </View>

                    {/* Comments List */}
                    <FlatList
                        data={post.commentsData || []}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <CommentItem comment={item} />}
                        style={styles.commentsList}
                        contentContainerStyle={styles.commentsContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyComments}>
                                <Icon name="chat-bubble-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyCommentsText}>No comments yet</Text>
                                <Text style={styles.emptyCommentsSubtext}>
                                    Be the first to share your thoughts!
                                </Text>
                            </View>
                        )}
                        ListFooterComponent={() => <View style={{ height: 20 }} />}
                    />

                    {/* Comment Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputRow}>
                            <View style={styles.inputAvatar}>
                                <Text style={styles.inputAvatarText}>Y</Text>
                            </View>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Write a supportive comment..."
                                placeholderTextColor="#9CA3AF"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                maxLength={300}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    !commentText.trim() && styles.sendButtonDisabled
                                ]}
                                onPress={handleSendComment}
                                disabled={!commentText.trim()}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name="send" 
                                    size={18} 
                                    color={commentText.trim() ? "#6C63FF" : "#D1D5DB"} 
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.characterCount}>
                            {commentText.length}/300
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* User Profile Modal */}
            <UserProfileModal
                visible={showUserProfile}
                user={selectedUser}
                onClose={() => {
                    setShowUserProfile(false);
                    setSelectedUser(null);
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
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
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    placeholder: {
        width: 32,
    },
    postPreview: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    userDetails: {
        flex: 1,
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2153',
    },
    timestamp: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    categoryTag: {
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6C63FF',
    },
    postContent: {
        fontSize: 14,
        lineHeight: 20,
        color: '#1F2153',
        marginBottom: 8,
    },
    postStats: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFF',
    },
    postStatsText: {
        fontSize: 12,
        color: '#6B7280',
    },
    commentsList: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    commentsContent: {
        paddingTop: 8,
    },
    commentItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFF',
    },
    commentHeader: {
        marginBottom: 8,
    },
    commentUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    commentAvatarText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    commentDetails: {
        flex: 1,
    },
    commentUsername: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2153',
    },
    commentTimestamp: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
        color: '#1F2153',
        marginLeft: 36,
        marginBottom: 8,
    },
    commentActions: {
        marginLeft: 36,
    },
    commentLikeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    commentLikedButton: {
        backgroundColor: '#FFF0F5',
    },
    commentLikeText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
    },
    commentLikedText: {
        color: '#FF4081',
    },
    emptyComments: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyCommentsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
        marginTop: 16,
    },
    emptyCommentsSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F4FF',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    inputAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputAvatarText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1F2153',
        maxHeight: 80,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#F8FAFF',
    },
    characterCount: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
});

export default CommentsModal;