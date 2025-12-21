import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
// Header component removed
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import CommentsModal from '../components/CommentsModal';
import { BASE_URL } from '../constants';
import { useUser } from '../context/UserContext';

const ForumScreen = ({ route }) => {
    const navigation = useNavigation();
    const { forumId, forumName, forumData } = route.params || {};
    const [posts, setPosts] = useState([]);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showForumInfo, setShowForumInfo] = useState(false);
    const { currentUser } = useUser()

    const [forumDetails, setForumDetails] = useState(() => {
        const initialData = forumData || {};
        return {
            name: forumName || initialData.name || "Loading...",
            icon: initialData.icon || "https://via.placeholder.com/100",
            description: initialData.description || "Loading...",
            members: Array.isArray(initialData.members) ? initialData.members : [],
            totalMembers: initialData.totalMembers
        };
    });

    useEffect(() => {
        if (!forumId) return;

        const fetchPosts = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/post/forum/${forumId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.accessToken}`,
                    },
                });
                const data = await res.json();
                console.log(data)
                if (data.success) {
                    setPosts(data.data);
                }
            } catch (err) {
                console.error('Error fetching posts:', err);
            }
        };

        const fetchForumDetails = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/forum/${forumId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.accessToken}`,
                    },
                });
                const data = await res.json();
                if (data.success) {
                    setForumDetails(prev => ({ ...prev, ...data.data }));
                }
            } catch (err) {
                console.error('Error fetching forum details:', err);
            }
        };

        const fetchMembers = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/forum/members/${forumId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.accessToken}`,
                    },
                });
                const data = await res.json();
                if (data.success) {
                    // Backend returns forum object with members populated
                    // data.data.members is the array
                    const members = data.data.members.map(m => ({
                        id: m._id,
                        name: m.annonymousUsername,
                        isOnline: m.isActive,
                        avatar: m.avatar
                    }));
                    setForumDetails(prev => ({ ...prev, members }));
                }
            } catch (err) {
                console.error('Error fetching members:', err);
            }
        };

        fetchPosts();
        fetchForumDetails();
        fetchMembers();
    }, [forumId]);

    const handleLeaveForum = async () => {
        Alert.alert(
            "Leave Forum",
            "Are you sure you want to leave this forum?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Leave", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/api/v1/forum/leave/${forumId}`, {
                                method: 'GET',
                                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                            });
                            if (res.ok) {
                                navigation.goBack();
                            } else {
                                Alert.alert("Error", "Failed to leave forum");
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "An error occurred");
                        }
                    }
                }
            ]
        );
    };

    const handleDeletePost = async (postId) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/api/v1/post/delete/${postId}`, {
                                method: 'DELETE',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${currentUser.accessToken}` 
                                },
                                body: JSON.stringify({ forumId })
                            });
                            if (res.ok) {
                                setPosts(prev => prev.filter(p => p._id !== postId));
                            } else {
                                const error = await res.json();
                                Alert.alert("Error", error.message || "Failed to delete post");
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "An error occurred");
                        }
                    }
                }
            ]
        );
    };

    const handleEditPost = async (postId, newText) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/post/edit/${postId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}` 
                },
                body: JSON.stringify({ text: newText })
            });
            if (res.ok) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, text: newText } : p));
                return true;
            } else {
                Alert.alert("Error", "Failed to edit post");
                return false;
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "An error occurred");
            return false;
        }
    };

    const handleLike = async (postId) => {
        const post = posts.find(p => p._id === postId);
        const isLiked = post.likedByUser;
        
        // Optimistic update
        setPosts(prevPosts => 
            prevPosts.map(p => 
                p._id === postId
                    ? { 
                        ...p, 
                        totalLikes: isLiked ? (p.totalLikes || 0) - 1 : (p.totalLikes || 0) + 1,
                        likedByUser: !isLiked
                    }
                    : p
            )
        );

        try {
            const res = await fetch(`${BASE_URL}/api/v1/like/${isLiked ? 'unlike/post' : 'post'}/${postId}`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`,
                },
            });
            
            if (!res.ok) {
                throw new Error('Failed to like/unlike post');
            }
        } catch (error) {
            console.error("Failed to like/unlike post", error);
            // Revert state
            setPosts(prevPosts => 
                prevPosts.map(p => 
                    p._id === postId
                        ? { 
                            ...p, 
                            totalLikes: post.totalLikes,
                            likedByUser: isLiked
                        }
                        : p
                )
            );
            Alert.alert("Error", "Failed to update like");
        }
    };

    const handleComment = async (postId) => {
        const post = posts.find(p => p._id === postId);
        setShowCommentsModal(true);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/comment/post/${postId}`, {
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            const data = await res.json();
            console.log("Comments", data)
            if (data.success) {
                setSelectedPost({ ...post, commentsData: data.data });
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    const handleCreatePost = async (newPost) => {
        try {
            let finalImageUrl = null;

            if (newPost.imageData) {
                const { fileName, type, uri } = newPost.imageData;
                const uniqueFileName = `Post-${Date.now()}`;

                const signedUrlRes = await fetch(`${BASE_URL}/api/v1/user/signed-url?fileName=${uniqueFileName}&fileType=${type}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${currentUser.accessToken}`,
                    },
                });
                
                const signedUrlData = await signedUrlRes.json();
                if (!signedUrlData.success) {
                    console.error('Failed to get signed URL:', signedUrlData.message);
                    Alert.alert("Error", "Failed to prepare image upload");
                    return;
                }
                
                const { signedUrl } = signedUrlData.data;

                const imageRes = await fetch(uri);
                const blob = await imageRes.blob();
                console.log(blob)

                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': type,
                    }
                });

                if (!uploadRes.ok) {
                    console.error('Failed to upload image to S3');
                    Alert.alert("Error", "Failed to upload image");
                    return;
                }

                finalImageUrl = signedUrl.split('?')[0];
            }

            const res = await fetch(`${BASE_URL}/api/v1/post/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`,
                },
                body: JSON.stringify({
                    text: newPost.content,
                    imageUrl: finalImageUrl,
                    forumId: forumId
                })
            });
            const data = await res.json();
            console.log(data);
            if (data.success) {
                const createdPost = data.data;
                const newPostData = {
                    ...createdPost,
                    createdBy: [{
                        _id: currentUser._id,
                        annonymousUsername: currentUser.annonymousUsername || 'You',
                        avatar: currentUser.avatar
                    }],
                    totalLikes: 0,
                    totalComment: 0,
                    commentsData: []
                };
                setPosts(prevPosts => [newPostData, ...prevPosts]);
                setShowCreatePost(false);
            } else {
                console.error('Failed to create post:', data.message);
            }
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    const handleAddComment = async (postId, commentText) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/comment/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}` 
                },
                body: JSON.stringify({ postId, comment: commentText })
            });
            const data = await res.json();
            console.log("New Comment from server", data)
            if (data.success) {
                let newComment = {
                    ...data.data,
                    commenter: {
                        _id: currentUser._id,
                        annonymousUsername: currentUser.annonymousUsername || 'You',
                        avatar: currentUser.avatar
                    }
                }
                console.log("New Comment in client", newComment)
                setPosts(prevPosts => 
                    prevPosts.map(post => 
                        post._id === postId 
                            ? { 
                                ...post, 
                                totalComments: (post.totalComments || 0) + 1,
                                commentsData: [newComment, ...(post.commentsData || [])]
                            }
                            : post
                    )
                );

                // Update selected post for modal
                setSelectedPost(prevPost => ({
                    ...prevPost,
                    totalComments: (prevPost.totalComments || 0) + 1,
                    commentsData: [newComment, ...(prevPost.commentsData || [])]
                }));
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    const handleLikeComment = async (postId, commentId) => {
        // Optimistic update
        const updateLikeState = (liked) => {
            const updateComment = (comment) => {
                if (comment._id === commentId) {
                    return {
                        ...comment,
                        totalLikes: liked ? (comment.totalLikes || 0) - 1 : (comment.totalLikes || 0) + 1,
                        likedByUser: !liked
                    };
                }
                return comment;
            };

            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, commentsData: (post.commentsData || []).map(updateComment) }
                        : post
                )
            );

            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prevPost => ({
                    ...prevPost,
                    commentsData: (prevPost.commentsData || []).map(updateComment)
                }));
            }
        };

        // Find current state
        const post = posts.find(p => p._id === postId);
        const comment = post?.commentsData?.find(c => c._id === commentId) || 
                       selectedPost?.commentsData?.find(c => c._id === commentId);
        
        if (!comment) return;
        const isLiked = !!comment.likedByUser;

        updateLikeState(isLiked);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/like/${isLiked ? 'unlike/comment' : 'comment'}/${commentId}`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            
            if (!res.ok) {
                // Revert if failed
                updateLikeState(!isLiked);
                console.error("Failed to like/unlike comment");
            }
        } catch (err) {
            updateLikeState(!isLiked);
            console.error("Error liking comment:", err);
        }
    };

    const handleEditComment = async (commentId, newText) => {
        // Optimistic update
        const originalPosts = [...posts];
        const originalSelectedPost = { ...selectedPost };

        const updateComment = (comment) => 
            comment._id === commentId ? { ...comment, comment: newText } : comment;

        setPosts(prev => prev.map(p => ({
            ...p,
            commentsData: (p.commentsData || []).map(updateComment)
        })));
        
        if (selectedPost) {
            setSelectedPost(prev => ({
                ...prev,
                commentsData: (prev.commentsData || []).map(updateComment)
            }));
        }

        try {
            const res = await fetch(`${BASE_URL}/api/v1/comment/${commentId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}` 
                },
                body: JSON.stringify({ comment: newText })
            });
            
            if (res.ok) {
                return true;
            } else {
                throw new Error("Failed to edit comment");
            }
        } catch (err) {
            console.error(err);
            // Revert state
            setPosts(originalPosts);
            setSelectedPost(originalSelectedPost);
            Alert.alert("Error", "Failed to edit comment");
            return false;
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/comment/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
            });
            
            if (res.ok) {
                const filterComments = (comments) => comments.filter(c => c._id !== commentId);

                setPosts(prev => prev.map(p => 
                    p._id === postId ? { 
                        ...p, 
                        totalComment: Math.max(0, (p.totalComment || 0) - 1),
                        commentsData: filterComments(p.commentsData || []) 
                    } : p
                ));
                
                if (selectedPost && selectedPost._id === postId) {
                    setSelectedPost(prev => ({
                        ...prev,
                        totalComment: Math.max(0, (prev.totalComment || 0) - 1),
                        commentsData: filterComments(prev.commentsData || [])
                    }));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderPost = ({ item }) => (
        <PostCard
            post={item}
            onLike={() => handleLike(item._id)}
            onComment={() => handleComment(item._id)}
            onEdit={(newText) => handleEditPost(item._id, newText)}
            onDelete={() => handleDeletePost(item._id)}
            currentUserId={currentUser._id}
        />
    );
    

    return (
        <SafeAreaView style={styles.container}>
            {/* Forum Header - Clickable */}
            <View style={styles.forumHeader}>
                <TouchableOpacity 
                    style={styles.headerLeft}
                    onPress={() => setShowForumInfo(true)}
                    activeOpacity={0.7}
                >
                    <Image 
                        source={{ uri: forumDetails.icon }} 
                        style={styles.forumIcon} 
                    />
                    <View>
                        <Text style={styles.forumName}>{forumDetails.name}</Text>
                        <Text style={styles.memberCountSubtitle}>
                            {forumDetails.totalMembers} members
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.createPostButton}
                    onPress={() => {
                        console.log('Button pressed, setting showCreatePost to true');
                        setShowCreatePost(true);
                    }}
                >
                    <Icon name="add" size={18} color="#6C63FF" />
                    <Text style={styles.createPostButtonText}>New Post</Text>
                </TouchableOpacity>
            </View>

            {/* Posts Feed */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
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

            {/* Comments Modal */}
            <CommentsModal
                visible={showCommentsModal}
                post={selectedPost}
                onClose={() => {
                    setShowCommentsModal(false);
                    setSelectedPost(null);
                }}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
            />

            {/* Forum Info Modal */}
            <Modal
                visible={showForumInfo}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForumInfo(false)}
            >
                <SafeAreaView style={styles.infoModalContainer}>
                    <View style={styles.infoModalHeader}>
                        <Text style={styles.infoModalTitle}>About Forum</Text>
                        <TouchableOpacity onPress={() => setShowForumInfo(false)}>
                            <Icon name="close" size={24} color="#1F2153" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView contentContainerStyle={styles.infoModalContent}>
                        <View style={styles.infoHero}>
                            <Image source={{ uri: forumDetails.icon }} style={styles.infoHeroIcon} />
                            <Text style={styles.infoHeroName}>{forumDetails.name}</Text>
                            <Text style={styles.infoDescription}>{forumDetails.description}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Members ({forumDetails.totalMembers})</Text>
                        <View style={styles.membersList}>
                            {forumDetails.members.map(member => (
                                <View key={member._id} style={styles.memberItem}>
                                    <View style={styles.memberAvatarContainer}>
                                        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                                        {member.isOnline && <View style={styles.onlineBadge} />}
                                    </View>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberStatus}>{member.isOnline ? 'Online' : 'Offline'}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.leaveButton}
                            onPress={handleLeaveForum}
                        >
                            <Icon name="logout" size={20} color="#EF4444" />
                            <Text style={styles.leaveButtonText}>Leave Forum</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
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
        paddingTop: 35,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    forumIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F4FF',
    },
    forumName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2153',
    },
    memberCountSubtitle: {
        fontSize: 12,
        color: '#6B7280',
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
    // Modal Styles
    infoModalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    infoModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    infoModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    infoModalContent: {
        padding: 20,
    },
    infoHero: {
        alignItems: 'center',
        marginBottom: 30,
    },
    infoHeroIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        marginBottom: 16,
    },
    infoHeroName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 8,
    },
    infoDescription: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 16,
    },
    membersList: {
        gap: 16,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberAvatarContainer: {
        position: 'relative',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2153',
        flex: 1,
    },
    memberStatus: {
        fontSize: 14,
        color: '#6B7280',
    },
    leaveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        paddingVertical: 12,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FECaca',
        gap: 8,
        marginBottom: 20,
    },
    leaveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
});

export default ForumScreen;