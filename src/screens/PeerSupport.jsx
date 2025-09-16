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
    Image,
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
                ) : item.type === 'volunteer' ? (
                    <View style={styles.volunteerAvatarContainer}>
                        <Image
                            source={{ uri: item.avatar }}
                            style={styles.volunteerAvatar}
                            defaultSource={require('../assets/default-avatar.jpg')}
                        />
                        <View style={styles.volunteerBadge}>
                            <Icon name="verified" size={12} color="#059669" />
                        </View>
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
                    <View style={styles.nameContainer}>
                        <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                        {item.type === 'volunteer' && (
                            <View style={styles.volunteerTag}>
                                <Text style={styles.volunteerTagText}>Volunteer</Text>
                            </View>
                        )}
                    </View>
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
                    ) : item.type === 'volunteer' ? (
                        <>
                            <Text style={styles.volunteerSpecialty} numberOfLines={1}>
                                {item.specialty}
                            </Text>
                            {item.unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>
                                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                    </Text>
                                </View>
                            )}
                        </>
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

/* ---------- Volunteers Modal Component ---------- */
const VolunteersModal = ({ visible, onClose, onStartChat }) => {
    const volunteers = [
        {
            id: 'vol_1',
            name: 'Dr. Sarah Johnson',
            specialty: 'Anxiety & Stress Management',
            experience: '8 years',
            rating: 4.9,
            avatar: 'https://images.unsplash.com/photo-1594824575670-8a0e6e8c21b6?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            description: 'Licensed therapist specializing in cognitive behavioral therapy and mindfulness techniques.',
        },
        {
            id: 'vol_2',
            name: 'Michael Chen',
            specialty: 'Student Support & Academic Stress',
            experience: '5 years',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            description: 'Educational psychologist with expertise in study habits and academic pressure management.',
        },
        {
            id: 'vol_3',
            name: 'Dr. Emily Rodriguez',
            specialty: 'Depression & Mood Disorders',
            experience: '12 years',
            rating: 4.9,
            avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            description: 'Clinical psychologist specializing in depression treatment and emotional wellness.',
        },
        {
            id: 'vol_4',
            name: 'James Wilson',
            specialty: 'Workplace Wellness & Burnout',
            experience: '7 years',
            rating: 4.7,
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            description: 'Occupational therapist focused on work-life balance and preventing professional burnout.',
        },
        {
            id: 'vol_5',
            name: 'Dr. Lisa Thompson',
            specialty: 'Sleep & Recovery Therapy',
            experience: '9 years',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
            isOnline: true,
            description: 'Sleep specialist and wellness coach helping with insomnia and recovery techniques.',
        },
    ];

    const VolunteerItem = ({ volunteer }) => (
        <View style={styles.volunteerItem}>
            <View style={styles.volunteerHeader}>
                <View style={styles.volunteerAvatarSection}>
                    <Image
                        source={{ uri: volunteer.avatar }}
                        style={styles.volunteerModalAvatar}
                        defaultSource={require('../assets/default-avatar.jpg')}
                    />
                    {volunteer.isOnline && <View style={styles.volunteerOnlineIndicator} />}
                </View>
                
                <View style={styles.volunteerInfo}>
                    <View style={styles.volunteerNameRow}>
                        <Text style={styles.volunteerName}>{volunteer.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Icon name="star" size={14} color="#FFC107" />
                            <Text style={styles.ratingText}>{volunteer.rating}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.volunteerSpecialtyModal}>{volunteer.specialty}</Text>
                    <Text style={styles.volunteerExperience}>{volunteer.experience} experience</Text>
                    <Text style={styles.volunteerDescription} numberOfLines={2}>
                        {volunteer.description}
                    </Text>
                </View>
            </View>
            
            <View style={styles.volunteerActions}>
                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusBadge, 
                        volunteer.isOnline ? styles.statusOnline : styles.statusOffline
                    ]}>
                        <Text style={[
                            styles.statusText,
                            volunteer.isOnline ? styles.statusTextOnline : styles.statusTextOffline
                        ]}>
                            {volunteer.isOnline ? 'Available' : 'Offline'}
                        </Text>
                    </View>
                </View>
                
                <TouchableOpacity
                    style={[
                        styles.chatVolunteerButton,
                        !volunteer.isOnline && styles.chatVolunteerButtonDisabled
                    ]}
                    onPress={() => onStartChat(volunteer)}
                    disabled={!volunteer.isOnline}
                >
                    <Icon 
                        name="chat" 
                        size={16} 
                        color={volunteer.isOnline ? "#FFFFFF" : "#9CA3AF"} 
                    />
                    <Text style={[
                        styles.chatVolunteerButtonText,
                        !volunteer.isOnline && styles.chatVolunteerButtonTextDisabled
                    ]}>
                        Start Chat
                    </Text>
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
            <SafeAreaView style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Trained Volunteers</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Icon name="info" size={20} color="#059669" />
                    <Text style={styles.infoBannerText}>
                        Connect with certified mental health volunteers for professional support
                    </Text>
                </View>

                {/* Volunteers List */}
                <FlatList
                    data={volunteers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <VolunteerItem volunteer={item} />}
                    style={styles.volunteersList}
                    contentContainerStyle={styles.volunteersListContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.volunteerSeparator} />}
                />
            </SafeAreaView>
        </Modal>
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
    const [showVolunteersModal, setShowVolunteersModal] = useState(false);
    const [volunteerChats, setVolunteerChats] = useState([]);

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
        // Volunteer chats (at the top)
        ...volunteerChats,
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
            // Add volunteer messages
            'vol_1': [
                { id: '1', text: 'Hello! I\'m Dr. Sarah Johnson. I\'m here to help you with any anxiety or stress concerns you might have.', sender: 'other', senderName: 'Dr. Sarah Johnson', time: 'Just now', avatar: 'https://images.unsplash.com/photo-1594824575670-8a0e6e8c21b6?w=150&h=150&fit=crop&crop=face' },
                { id: '2', text: 'Feel free to share what\'s on your mind. This is a safe space.', sender: 'other', senderName: 'Dr. Sarah Johnson', time: 'Just now', avatar: 'https://images.unsplash.com/photo-1594824575670-8a0e6e8c21b6?w=150&h=150&fit=crop&crop=face' },
            ],
            'vol_2': [
                { id: '1', text: 'Hi there! I\'m Michael Chen, and I specialize in helping students manage academic stress and study pressures.', sender: 'other', senderName: 'Michael Chen', time: 'Just now', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face' },
            ],
            // Add more volunteer message patterns...
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
            // Navigate to Chat Screen for individual chats or volunteers
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

    const handleStartVolunteerChat = (volunteer) => {
        // Close modal
        setShowVolunteersModal(false);

        // Create volunteer chat item
        const volunteerChat = {
            id: volunteer.id,
            name: volunteer.name,
            type: 'volunteer',
            specialty: volunteer.specialty,
            avatar: volunteer.avatar,
            lastMessage: 'Started conversation',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            isOnline: volunteer.isOnline,
        };

        // Add to volunteer chats if not already present
        setVolunteerChats(prev => {
            const exists = prev.find(chat => chat.id === volunteer.id);
            if (!exists) {
                return [volunteerChat, ...prev];
            }
            return prev;
        });

        // Navigate to chat
        const messages = getMockMessages(volunteer.id);
        navigation.navigate('ChatScreen', {
            chat: volunteerChat,
            messages: messages,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <View style={styles.chatListHeader}>
                <Text style={styles.screenTitle}>Community</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.volunteersButton}
                        onPress={() => setShowVolunteersModal(true)}
                    >
                        <Icon name="psychology" size={16} color="#059669" />
                        <Text style={styles.volunteersButtonText}>Volunteers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.joinForumButton}
                        onPress={() => setShowJoinModal(true)}
                    >
                        <Text style={styles.joinForumButtonText}>Forum</Text>
                        <Icon name="add" size={18} color="#6C63FF" />
                    </TouchableOpacity>
                </View>
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

            {/* Volunteers Modal */}
            <VolunteersModal
                visible={showVolunteersModal}
                onClose={() => setShowVolunteersModal(false)}
                onStartChat={handleStartVolunteerChat}
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
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    volunteersButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        gap: 6,
    },
    volunteersButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
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
    volunteerAvatarContainer: {
        position: 'relative',
        width: 50,
        height: 50,
    },
    volunteerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
    },
    volunteerBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ECFDF5',
        borderWidth: 2,
        borderColor: '#FFFFFF',
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
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
    },
    volunteerTag: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    volunteerTagText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#059669',
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
    volunteerSpecialty: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '500',
        flex: 1,
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

    // Volunteers Modal Styles
    volunteersList: {
        flex: 1,
    },
    volunteersListContent: {
        paddingVertical: 8,
    },
    volunteerSeparator: {
        height: 1,
        backgroundColor: '#F0F4FF',
        marginHorizontal: 16,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    infoBannerText: {
        fontSize: 12,
        color: '#059669',
        flex: 1,
        lineHeight: 18,
    },
    volunteerItem: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    volunteerHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    volunteerAvatarSection: {
        position: 'relative',
        marginRight: 12,
    },
    volunteerModalAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F4FF',
    },
    volunteerOnlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    volunteerInfo: {
        flex: 1,
    },
    volunteerNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    volunteerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    volunteerSpecialtyModal: {
        fontSize: 14,
        fontWeight: '500',
        color: '#059669',
        marginBottom: 2,
    },
    volunteerExperience: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 6,
    },
    volunteerDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    volunteerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusContainer: {
        flex: 1,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusOnline: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    statusOffline: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '500',
    },
    statusTextOnline: {
        color: '#059669',
    },
    statusTextOffline: {
        color: '#6B7280',
    },
    chatVolunteerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    chatVolunteerButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    chatVolunteerButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    chatVolunteerButtonTextDisabled: {
        color: '#9CA3AF',
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