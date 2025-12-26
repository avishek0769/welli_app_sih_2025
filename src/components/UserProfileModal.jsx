import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    Animated,
    Alert,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useUser } from '../context/UserContext';

const UserProfileModal = ({ visible, user, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();
    const { startChat } = useUser();

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    if (!user) return null;

    const handleStartChat = async () => {
        onClose();
        const chat = await startChat(user._id);
        if (chat) {
            navigation.navigate('ChatScreen', {
                chat: {
                    ...chat,
                    participant: {
                        _id: user._id,
                        annonymousUsername: user.username,
                        avatar: user.avatar
                    },
                    name: user.username,
                    avatar: user.avatar
                }
            });
        }
    };

    const handleBlock = () => {
        Alert.alert(
            'Block User',
            `Are you sure you want to block ${user.username}? You won't see their posts or receive messages from them.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Block', 
                    style: 'destructive',
                    onPress: () => {
                        onClose();
                        Alert.alert('User Blocked', `${user.username} has been blocked.`);
                    }
                }
            ]
        );
    };

    const handleReport = () => {
        Alert.alert(
            'Report User',
            'Why are you reporting this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Spam', onPress: () => submitReport('Spam') },
                { text: 'Inappropriate Content', onPress: () => submitReport('Inappropriate Content') },
                { text: 'Harassment', onPress: () => submitReport('Harassment') },
                { text: 'Other', onPress: () => submitReport('Other') },
            ]
        );
    };

    const submitReport = (reason) => {
        onClose();
        Alert.alert(
            'Report Submitted',
            `Thank you for reporting. We'll review ${user.username}'s account for ${reason.toLowerCase()}.`
        );
    };

    const ActionButton = ({ icon, text, onPress, isDestructive = false }) => (
        <TouchableOpacity
            style={[styles.actionButton, isDestructive && styles.actionButtonDestructive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Icon 
                name={icon} 
                size={20} 
                color={isDestructive ? "#DC2626" : "#6C63FF"} 
            />
            <Text style={[
                styles.actionButtonText, 
                isDestructive && styles.actionButtonTextDestructive
            ]}>
                {text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity 
                    style={styles.backdropTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View style={styles.backdropTouchable} />
                </TouchableOpacity>
                
                <Animated.View style={[
                    styles.modalContainer,
                    {
                        transform: [{
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            })
                        }]
                    }
                ]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.avatar, !user.avatar && { backgroundColor: '#6C63FF', borderRadius: 40 }]}>
                                {user.avatar ? <Image source={{ uri: user.avatar }}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                /> : (
                                    <Text style={styles.avatarText}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.username}>{user.username}</Text>
                                <Text style={styles.joinDate}>{user.joinDate}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Icon name="close" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Posts Count */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{user.postsCount}</Text>
                            <Text style={styles.statLabel}>Total Posts</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <Text style={styles.actionsTitle}>Actions</Text>
                        
                        <ActionButton
                            icon="chat"
                            text="Start Personal Chat"
                            onPress={handleStartChat}
                        />
                        
                        <ActionButton
                            icon="block"
                            text="Block User"
                            onPress={handleBlock}
                            isDestructive={true}
                        />
                        
                        <ActionButton
                            icon="report"
                            text="Report User"
                            onPress={handleReport}
                            isDestructive={true}
                        />
                    </View>

                    {/* Community Guidelines Notice */}
                    <View style={styles.guidelinesNotice}>
                        <Icon name="info" size={16} color="#6B7280" />
                        <Text style={styles.guidelinesText}>
                            Remember to follow community guidelines when interacting with others.
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backdropTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 2,
    },
    joinDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8FAFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionsContainer: {
        padding: 20,
    },
    actionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFF',
        borderWidth: 1,
        borderColor: '#E8F0FF',
        marginBottom: 8,
        gap: 12,
    },
    actionButtonDestructive: {
        backgroundColor: '#FEFCFC',
        borderColor: '#FECACA',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6C63FF',
        flex: 1,
    },
    actionButtonTextDestructive: {
        color: '#DC2626',
    },
    guidelinesNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8FAFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        gap: 8,
    },
    guidelinesText: {
        fontSize: 11,
        color: '#6B7280',
        lineHeight: 16,
        flex: 1,
    },
});

export default UserProfileModal;