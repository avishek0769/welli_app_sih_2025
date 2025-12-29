import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserProfileModal from './UserProfileModal';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onLike, onComment, onEdit, onDelete, currentUserId }) => {
    const [imageError, setImageError] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editText, setEditText] = useState(post.text);

    const formatLikes = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    const formatComments = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    const handleUserPress = () => {
        setShowUserProfile(true);
    };

    const handleAction = () => {
        Alert.alert(
            "Manage Post",
            "What would you like to do?",
            [
                {
                    text: "Edit",
                    onPress: () => {
                        setEditText(post.text);
                        setShowEditModal(true);
                    }
                },
                {
                    text: "Delete",
                    onPress: () => {
                        Alert.alert(
                            "Delete Post",
                            "Are you sure you want to delete this post?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { 
                                    text: "Delete", 
                                    style: "destructive",
                                    onPress: onDelete
                                }
                            ]
                        );
                    },
                    style: "destructive"
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleSaveEdit = () => {
        if (editText.trim() !== post.text) {
            onEdit(editText.trim());
        }
        setShowEditModal(false);
    };

    const username = post.createdBy.annonymousUsername || 'Anonymous';
    const avatar = post.createdBy.avatar || null;
    const timestamp = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now';
    const category = post.category || 'General';
    const content = post.text;
    const likesCount = post.totalLikes || 0;
    const commentsCount = post.totalComments || 0;
    const isOwner = post.createdBy._id === currentUserId;

    return (
        <View style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <TouchableOpacity 
                    style={styles.userInfo}
                    onPress={handleUserPress}
                    activeOpacity={0.7}
                >
                    <View style={[styles.avatar, !avatar && { backgroundColor: '#6C63FF', borderRadius: 20 }]}>
                        {avatar && <Image source={{ uri: avatar }}
                            style={styles.avatar}
                            resizeMode="cover"
                        />}
                        {!avatar && (
                            <Text style={styles.avatarText}>
                                {username.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.username}>{username}</Text>
                        <Text style={styles.timestamp}>{timestamp}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                    {isOwner && (
                        <TouchableOpacity onPress={handleAction}>
                            <Icon name="more-vert" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Post Content */}
            <View style={styles.postContent}>
                <Text style={styles.postText}>{content}</Text>
                
                {/* Post Image */}
                {post.image && !imageError && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: post.image }}
                            style={styles.postImage}
                            resizeMode="cover"
                            onError={() => setImageError(true)}
                        />
                    </View>
                )}
            </View>

            {/* Post Actions */}
            <View style={styles.postActions}>
                <TouchableOpacity
                    style={[styles.actionButton, post.likedByUser && styles.likedButton]}
                    onPress={onLike}
                    activeOpacity={0.7}
                >
                    <Icon 
                        name={post.likedByUser ? "favorite" : "favorite-border"} 
                        size={18} 
                        color={post.likedByUser ? "#FF4081" : "#6B7280"} 
                    />
                    <Text style={[
                        styles.actionText,
                        post.likedByUser && styles.likedText
                    ]}>
                        {formatLikes(likesCount)}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                    activeOpacity={0.7}
                >
                    <Icon name="chat-bubble-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{formatComments(commentsCount)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    <Icon name="share" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* User Profile Modal */}
            <UserProfileModal
                visible={showUserProfile}
                user={{
                    _id: post.createdBy._id,
                    username: username,
                    avatar: avatar,
                    joinDate: 'Joined 3 months ago',
                    category: category,
                }}
                onClose={() => setShowUserProfile(false)}
            />

            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Post</Text>
                        <TextInput
                            style={styles.editInput}
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    postCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F4FF',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
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
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    categoryTag: {
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6C63FF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1F2153',
    },
    editInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
        color: '#1F2153',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#6C63FF',
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '500',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    postContent: {
        marginBottom: 16,
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#1F2153',
        fontWeight: '400',
    },
    imageContainer: {
        marginTop: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F8FAFF',
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFF',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        gap: 4,
    },
    likedButton: {
        backgroundColor: '#FFF0F5',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    likedText: {
        color: '#FF4081',
    },
    spacer: {
        flex: 1,
    },
});

export default PostCard;