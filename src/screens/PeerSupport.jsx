import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgUri } from 'react-native-svg';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

/* ---------- Chat/Forum List Item Component ---------- */
const ChatListItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
                {item.type === 'forum' ? (
                    <View style={styles.forumAvatar}>
                        <Icon name="forum" size={24} color="#6C63FF" />
                    </View>
                ) : (
                    <View style={styles.svgAvatarContainer}>
                        <SvgUri
                            uri={item.avatar}
                            width={50}
                            height={50}
                        />
                    </View>
                )}
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.chatTime}>
                        {item.type === 'forum' ? `${item.activeMembers} active` : item.lastMessageTime}
                    </Text>
                </View>

                <View style={styles.chatPreview}>
                    {item.type === 'forum' ? (
                        <View style={styles.forumPreview}>
                            <Text style={styles.forumDescription} numberOfLines={1}>
                                {item.description}
                            </Text>
                            <View style={styles.forumStats}>
                                <View style={styles.forumStat}>
                                    <Icon name="people" size={12} color="#6B7280" />
                                    <Text style={styles.forumStatText}>{item.members}</Text>
                                </View>
                                <View style={styles.forumStat}>
                                    <Icon name="article" size={12} color="#6B7280" />
                                    <Text style={styles.forumStatText}>{item.posts}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.lastMessage} numberOfLines={1}>
                                {item.lastMessage}
                            </Text>
                            {item.unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>
                                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

/* ---------- Join Forum Modal Component ---------- */
const JoinForumModal = ({ visible, onClose, onJoinForum }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredForums, setFilteredForums] = useState([]);

    // Available forums to join
    const availableForums = [
        {
            id: 'FORUM001',
            name: 'Mindfulness & Meditation',
            description: 'Daily meditation practices and mindfulness techniques',
            members: 245,
            posts: 1120,
            activeMembers: 24,
            category: 'Meditation',
            isPublic: true,
        },
        {
            id: 'FORUM002',
            name: 'Student Mental Health',
            description: 'Support for students dealing with academic stress',
            members: 186,
            posts: 890,
            activeMembers: 18,
            category: 'Academic',
            isPublic: true,
        },
        {
            id: 'FORUM003',
            name: 'Workplace Wellness',
            description: 'Managing work-life balance and professional stress',
            members: 320,
            posts: 1450,
            activeMembers: 32,
            category: 'Professional',
            isPublic: true,
        },
        {
            id: 'FORUM004',
            name: 'Sleep & Recovery Support',
            description: 'Tips and support for better sleep and recovery',
            members: 150,
            posts: 670,
            activeMembers: 15,
            category: 'Wellness',
            isPublic: true,
        },
        {
            id: 'FORUM005',
            name: 'Creative Expression Therapy',
            description: 'Art, music, and creative outlets for mental wellness',
            members: 210,
            posts: 980,
            activeMembers: 21,
            category: 'Creative',
            isPublic: true,
        },
        {
            id: 'FORUM006',
            name: 'Parent Support Network',
            description: 'Support for parents dealing with stress and challenges',
            members: 280,
            posts: 1340,
            activeMembers: 28,
            category: 'Family',
            isPublic: true,
        },
        {
            id: 'FORUM007',
            name: 'Grief & Loss Support',
            description: 'Compassionate support for those dealing with loss',
            members: 120,
            posts: 560,
            activeMembers: 12,
            category: 'Support',
            isPublic: true,
        },
    ];

    React.useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredForums(availableForums);
        } else {
            const filtered = availableForums.filter(forum =>
                forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                forum.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                forum.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                forum.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredForums(filtered);
        }
    }, [searchQuery]);

    React.useEffect(() => {
        if (visible) {
            setFilteredForums(availableForums);
            setSearchQuery('');
        }
    }, [visible]);

    const ForumItem = ({ forum }) => (
        <View style={styles.forumItem}>
            <View style={styles.forumItemHeader}>
                <View style={styles.forumIconContainer}>
                    <Icon name="forum" size={20} color="#6C63FF" />
                </View>
                <View style={styles.forumItemInfo}>
                    <Text style={styles.forumItemName}>{forum.name}</Text>
                    <Text style={styles.forumItemId}>ID: {forum.id}</Text>
                    <Text style={styles.forumItemDescription}>{forum.description}</Text>
                    <View style={styles.forumItemMeta}>
                        <View style={styles.categoryTag}>
                            <Text style={styles.categoryText}>{forum.category}</Text>
                        </View>
                        <View style={styles.forumItemStats}>
                            <Text style={styles.participantCount}>
                                {forum.members} members
                            </Text>
                            <Text style={styles.participantCount}>
                                {forum.posts} posts
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.joinButton}
                onPress={() => onJoinForum(forum)}
            >
                <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Join Forums</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Icon name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, ID, or category..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="clear" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Forums List */}
                <FlatList
                    data={filteredForums}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ForumItem forum={item} />}
                    style={styles.forumsList}
                    contentContainerStyle={styles.forumsListContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Icon name="search-off" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyStateText}>No forums found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Try searching with different keywords
                            </Text>
                        </View>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

/* ---------- Main Peer Support Component ---------- */
const PeerSupport = () => {
    const navigation = useNavigation();
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Generate cartoon SVG avatars for anonymity
    const getCartoonAvatar = (seed) => {
        const cartoonAvatars = [
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoey',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Max',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Mia',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Cleo',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Rex',
            'https://api.dicebear.com/9.x/personas/svg?seed=Peaceful',
            'https://api.dicebear.com/9.x/personas/svg?seed=Mindful',
            'https://api.dicebear.com/9.x/personas/svg?seed=Calm',
            'https://api.dicebear.com/9.x/personas/svg?seed=Strong',
            'https://api.dicebear.com/9.x/personas/svg?seed=Brave',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Hope',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Gentle',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Rising',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Quiet',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Inner',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Sophie',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver',
            'https://api.dicebear.com/9.x/personas/svg?seed=Emma',
            'https://api.dicebear.com/9.x/personas/svg?seed=Liam',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Ava',
            'https://api.dicebear.com/9.x/big-smile/svg?seed=Noah',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Isabella',
            'https://api.dicebear.com/9.x/adventurer/svg?seed=William',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=Charlotte',
            'https://api.dicebear.com/9.x/avataaars/svg?seed=James',
        ];
        return cartoonAvatars[seed % cartoonAvatars.length];
    };

    // Mixed data with forums and individual chats
    const chatsAndForums = [
        // Forums
        {
            id: 'FORUM001',
            name: 'Anxiety Support Forum',
            type: 'forum',
            description: 'A safe space to share experiences and support each other',
            members: 245,
            posts: 1120,
            activeMembers: 24,
            category: 'Mental Health',
        },
        {
            id: 'FORUM002',
            name: 'Student Wellness Hub',
            type: 'forum',
            description: 'Academic stress, study tips, and student life support',
            members: 186,
            posts: 890,
            activeMembers: 18,
            category: 'Academic',
        },
        {
            id: 'FORUM003',
            name: 'Mindfulness Corner',
            type: 'forum',
            description: 'Meditation practices, breathing exercises, and mindful living',
            members: 320,
            posts: 1450,
            activeMembers: 32,
            category: 'Meditation',
        },
        // Individual Chats
        {
            id: '2',
            name: 'Peaceful_Heart_89',
            type: 'individual',
            avatar: getCartoonAvatar(2),
            lastMessage: 'How are you feeling today?',
            lastMessageTime: '1:45 PM',
            unreadCount: 1,
            isOnline: true,
        },
        {
            id: '4',
            name: 'Calm_Spirit_67',
            type: 'individual',
            avatar: getCartoonAvatar(4),
            lastMessage: 'That meditation app really helped!',
            lastMessageTime: '11:30 AM',
            unreadCount: 0,
            isOnline: false,
        },
        // More Forums
        {
            id: 'FORUM004',
            name: 'Sleep & Recovery',
            type: 'forum',
            description: 'Better sleep habits and recovery techniques',
            members: 150,
            posts: 670,
            activeMembers: 15,
            category: 'Wellness',
        },
        // More Individual Chats
        {
            id: '6',
            name: 'Hope_Walker_34',
            type: 'individual',
            avatar: getCartoonAvatar(6),
            lastMessage: 'Hope you\'re doing well today',
            lastMessageTime: 'Yesterday',
            unreadCount: 0,
            isOnline: true,
        },
        {
            id: '7',
            name: 'Gentle_Wind_78',
            type: 'individual',
            avatar: getCartoonAvatar(7),
            lastMessage: 'The breathing exercises helped me a lot',
            lastMessageTime: 'Yesterday',
            unreadCount: 2,
            isOnline: false,
        },
        {
            id: '8',
            name: 'Rising_Phoenix_56',
            type: 'individual',
            avatar: getCartoonAvatar(8),
            lastMessage: 'Thank you for listening',
            lastMessageTime: '2 days ago',
            unreadCount: 0,
            isOnline: true,
        },
        {
            id: '9',
            name: 'Quiet_Strength_91',
            type: 'individual',
            avatar: getCartoonAvatar(9),
            lastMessage: 'Your advice really helped me',
            lastMessageTime: '2 days ago',
            unreadCount: 0,
            isOnline: false,
        },
        {
            id: '10',
            name: 'Inner_Light_25',
            type: 'individual',
            avatar: getCartoonAvatar(10),
            lastMessage: 'Good morning! Ready for today?',
            lastMessageTime: '3 days ago',
            unreadCount: 1,
            isOnline: true,
        },
    ];

    // Mock messages for individual chats
    const getMockMessages = (chatId) => {
        const messagesByChat = {
            '2': [
                { id: '1', text: 'Hello! I hope you\'re having a good day.', sender: 'other', senderName: 'Peaceful_Heart_89', time: '1:40 PM', avatar: getCartoonAvatar(2) },
                { id: '2', text: 'How are you feeling today?', sender: 'other', senderName: 'Peaceful_Heart_89', time: '1:45 PM', avatar: getCartoonAvatar(2) },
            ],
            '4': [
                { id: '1', text: 'Hey! How\'s your meditation practice going?', sender: 'other', senderName: 'Calm_Spirit_67', time: '11:25 AM', avatar: getCartoonAvatar(4) },
                { id: '2', text: 'That meditation app really helped!', sender: 'other', senderName: 'Calm_Spirit_67', time: '11:30 AM', avatar: getCartoonAvatar(4) },
            ],
            '6': [
                { id: '1', text: 'Hi! Just checking in on you.', sender: 'other', senderName: 'Hope_Walker_34', time: 'Yesterday', avatar: getCartoonAvatar(6) },
                { id: '2', text: 'Hope you\'re doing well today', sender: 'other', senderName: 'Hope_Walker_34', time: 'Yesterday', avatar: getCartoonAvatar(6) },
            ],
            '7': [
                { id: '1', text: 'The breathing exercises you suggested are amazing!', sender: 'other', senderName: 'Gentle_Wind_78', time: 'Yesterday', avatar: getCartoonAvatar(7) },
                { id: '2', text: 'The breathing exercises helped me a lot', sender: 'other', senderName: 'Gentle_Wind_78', time: 'Yesterday', avatar: getCartoonAvatar(7) },
            ],
            '8': [
                { id: '1', text: 'I really appreciate this community', sender: 'other', senderName: 'Rising_Phoenix_56', time: '2 days ago', avatar: getCartoonAvatar(8) },
                { id: '2', text: 'Thank you for listening', sender: 'other', senderName: 'Rising_Phoenix_56', time: '2 days ago', avatar: getCartoonAvatar(8) },
            ],
            '9': [
                { id: '1', text: 'I\'ve been practicing the techniques we discussed', sender: 'other', senderName: 'Quiet_Strength_91', time: '2 days ago', avatar: getCartoonAvatar(9) },
                { id: '2', text: 'Your advice really helped me', sender: 'other', senderName: 'Quiet_Strength_91', time: '2 days ago', avatar: getCartoonAvatar(9) },
            ],
            '10': [
                { id: '1', text: 'Starting my day with gratitude today!', sender: 'other', senderName: 'Inner_Light_25', time: '3 days ago', avatar: getCartoonAvatar(10) },
                { id: '2', text: 'Good morning! Ready for today?', sender: 'other', senderName: 'Inner_Light_25', time: '3 days ago', avatar: getCartoonAvatar(10) },
            ],
        };
        return messagesByChat[chatId] || [];
    };

    const handleItemPress = (item) => {
        if (item.type === 'forum') {
            // Navigate to Forum Screen for forums
            navigation.navigate('ForumScreen', {
                forumId: item.id,
                forumName: item.name,
                forumData: item,
            });
        } else {
            // Navigate to Chat Screen for individual chats
            const messages = getMockMessages(item.id);
            navigation.navigate('ChatScreen', {
                chat: item,
                messages: messages,
            });
        }
    };

    const handleJoinForum = (forum) => {
        // Close modal
        setShowJoinModal(false);

        // Navigate to the new forum
        navigation.navigate('ForumScreen', {
            forumId: forum.id,
            forumName: forum.name,
            forumData: {
                ...forum,
                members: forum.members + 1, // Add user to count
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <View style={styles.chatListHeader}>
                <Text style={styles.screenTitle}>Community</Text>
                <TouchableOpacity
                    style={styles.joinForumButton}
                    onPress={() => setShowJoinModal(true)}
                >
                    <Text style={styles.joinForumButtonText}>Forum</Text>
                    <Icon name="add" size={18} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={chatsAndForums}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatListItem
                        item={item}
                        onPress={() => handleItemPress(item)}
                    />
                )}
                style={styles.chatList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                    <View style={{ height: 70 }} />
                )}
            />

            {/* Join Forum Modal */}
            <JoinForumModal
                visible={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoinForum={handleJoinForum}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },

    // Chat List Styles
    chatListHeader: {
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
    joinForumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        gap: 6,
    },
    joinForumButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6C63FF',
    },
    chatList: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFF',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    forumAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    svgAvatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
    },
    chatTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    chatPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forumPreview: {
        flex: 1,
    },
    forumDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
    },
    forumStats: {
        flexDirection: 'row',
        gap: 16,
    },
    forumStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    forumStatText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    modalHeader: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    placeholder: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1F2153',
        marginLeft: 12,
    },
    forumsList: {
        flex: 1,
    },
    forumsListContent: {
        paddingHorizontal: 16,
    },
    forumItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F4FF',
    },
    forumItemHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    forumIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    forumItemInfo: {
        flex: 1,
    },
    forumItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 2,
    },
    forumItemId: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    forumItemDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 8,
    },
    forumItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryTag: {
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6C63FF',
    },
    forumItemStats: {
        alignItems: 'flex-end',
    },
    participantCount: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    joinButton: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-end',
    },
    joinButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default PeerSupport;