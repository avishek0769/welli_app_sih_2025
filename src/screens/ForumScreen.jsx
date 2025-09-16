import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const ForumScreen = () => {
    const [posts, setPosts] = useState([
        {
            id: '1',
            username: 'MindfulStudent_23',
            content: 'Just finished my first meditation session this week! Starting to feel more centered and focused. Has anyone else tried the breathing exercises from the wellness app?',
            image: null,
            likes: 12,
            comments: 3,
            likedByUser: false,
            timestamp: '2 hours ago',
            category: 'Mindfulness'
        },
        {
            id: '2',
            username: 'AnxietyWarrior_45',
            content: 'Sharing my progress: managed to attend my first social gathering in months! Small steps but feeling proud of myself. 💪',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
            likes: 28,
            comments: 8,
            likedByUser: true,
            timestamp: '4 hours ago',
            category: 'Progress'
        },
        {
            id: '3',
            username: 'StudyStress_Helper',
            content: 'Finals week is approaching and I\'m feeling overwhelmed. Any tips for managing study stress? I\'ve been having trouble sleeping and focusing.',
            image: null,
            likes: 15,
            comments: 12,
            likedByUser: false,
            timestamp: '6 hours ago',
            category: 'Academic Stress'
        },
        {
            id: '4',
            username: 'WellnessJourney_89',
            content: 'Found this beautiful spot for my morning walks. Nature therapy is real! Sometimes the best medicine is just getting outside and breathing fresh air.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            likes: 34,
            comments: 5,
            likedByUser: true,
            timestamp: '8 hours ago',
            category: 'Nature Therapy'
        },
        {
            id: '5',
            username: 'SleepStruggler_12',
            content: 'Has anyone tried sleep meditation apps? I\'ve been struggling with insomnia for weeks now and looking for natural solutions before considering medication.',
            image: null,
            likes: 9,
            comments: 15,
            likedByUser: false,
            timestamp: '12 hours ago',
            category: 'Sleep Issues'
        }
    ]);

    const [showCreatePost, setShowCreatePost] = useState(false);

    const handleLike = (postId) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
                        likedByUser: !post.likedByUser 
                    }
                    : post
            )
        );
    };

    const handleComment = (postId) => {
        // For now, just increment comment count
        // In a real app, this would open a comment modal
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId 
                    ? { ...post, comments: post.comments + 1 }
                    : post
            )
        );
    };

    const handleCreatePost = (newPost) => {
        const post = {
            id: Date.now().toString(),
            username: 'You',
            content: newPost.content,
            image: newPost.image,
            likes: 0,
            comments: 0,
            likedByUser: false,
            timestamp: 'Just now',
            category: newPost.category || 'General'
        };
        
        setPosts(prevPosts => [post, ...prevPosts]);
        setShowCreatePost(false);
    };

    const renderPost = ({ item }) => (
        <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item.id)}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            {/* Forum Header */}
            <View style={styles.forumHeader}>
                <Text style={styles.screenTitle}>Community Forums</Text>
                <TouchableOpacity
                    style={styles.createPostButton}
                    onPress={() => setShowCreatePost(true)}
                >
                    <Icon name="add" size={18} color="#6C63FF" />
                    <Text style={styles.createPostButtonText}>New Post</Text>
                </TouchableOpacity>
            </View>

            {/* Posts Feed */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPost}
                style={styles.postsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.postsContent}
                ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
                ListFooterComponent={() => <View style={{ height: 70 }} />}
            />

            {/* Create Post Modal */}
            <Modal
                visible={showCreatePost}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreatePost(false)}
            >
                <CreatePost
                    onCreatePost={handleCreatePost}
                    onCancel={() => setShowCreatePost(false)}
                />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    forumHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
    },
    createPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        gap: 6,
    },
    createPostButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6C63FF',
    },
    postsList: {
        flex: 1,
    },
    postsContent: {
        paddingTop: 8,
    },
    postSeparator: {
        height: 8,
    },
});

export default ForumScreen;