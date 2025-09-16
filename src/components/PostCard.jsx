import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onLike, onComment }) => {
    const [imageError, setImageError] = useState(false);

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

    return (
        <View style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {post.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.username}>{post.username}</Text>
                        <Text style={styles.timestamp}>{post.timestamp}</Text>
                    </View>
                </View>
                <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                </View>
            </View>

            {/* Post Content */}
            <View style={styles.postContent}>
                <Text style={styles.postText}>{post.content}</Text>
                
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
                        {formatLikes(post.likes)}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                    activeOpacity={0.7}
                >
                    <Icon name="chat-bubble-outline" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>{formatComments(post.comments)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    <Icon name="share" size={18} color="#6B7280" />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <View style={styles.spacer} />

                <TouchableOpacity
                    style={styles.moreButton}
                    activeOpacity={0.7}
                >
                    <Icon name="more-horiz" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#6C63FF',
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
    moreButton: {
        padding: 6,
        borderRadius: 16,
    },
});

export default PostCard;