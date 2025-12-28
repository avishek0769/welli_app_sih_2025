import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useUser } from '../context/UserContext';
import { BASE_URL } from '../constants';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
    const { currentUser, setCurrentUser } = useUser();
    const navigation = useNavigation();
    const [isUploading, setIsUploading] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await fetch(`${BASE_URL}/api/v1/user/logout`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                            });
                            await AsyncStorage.clear();
                            setCurrentUser(null);
                            navigation.navigate('Login');
                        } catch (error) {
                            console.error("Logout error", error);
                            Alert.alert("Error", "Failed to logout");
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/api/v1/user/delete-account`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                            });
                            
                            if (res.ok) {
                                await AsyncStorage.clear();
                                setCurrentUser(null);
                            } else {
                                throw new Error("Failed to delete account");
                            }
                        } catch (error) {
                            console.error("Delete account error", error);
                            Alert.alert("Error", "Failed to delete account");
                        }
                    }
                }
            ]
        );
    };

    const handleToggleMessages = async (value) => {
        setIsToggling(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/user/toggle-messages`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.accessToken}`
                },
                body: JSON.stringify({ acceptMessages: value })
            });
            const data = await res.json();
            
            if (data.success) {
                setCurrentUser(prev => ({ ...prev, acceptMessages: value }));
            } else {
                Alert.alert("Error", "Failed to update settings");
            }
        } catch (error) {
            console.error("Toggle error", error);
            Alert.alert("Error", "Failed to update settings");
        } finally {
            setIsToggling(false);
        }
    };

    const handleEditAvatar = async () => {
        const options = {
            mediaType: 'photo',
            quality: 0.5,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert("Error", "Image picker error");
                return;
            }

            const asset = response.assets[0];
            setIsUploading(true);

            try {
                // 1. Get Signed URL
                const fileName = `avatar-${currentUser._id}-${Date.now()}.jpg`;
                const signedUrlRes = await fetch(`${BASE_URL}/api/v1/user/signed-url?fileName=${fileName}&fileType=${asset.type}`, {
                    headers: { Authorization: `Bearer ${currentUser.accessToken}` }
                });
                const signedUrlData = await signedUrlRes.json();
                
                if (!signedUrlData.success) throw new Error("Failed to get upload URL");

                // 2. Upload to S3
                const uploadRes = await fetch(signedUrlData.data.signedUrl, {
                    method: 'PUT',
                    body: await fetch(asset.uri).then(r => r.blob()),
                    headers: {
                        'Content-Type': asset.type
                    }
                });

                if (!uploadRes.ok) throw new Error("Failed to upload image");

                // 3. Update User Profile
                const imageUrl = signedUrlData.data.signedUrl.split('?')[0];
                const updateRes = await fetch(`${BASE_URL}/api/v1/user/update-avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${currentUser.accessToken}`
                    },
                    body: JSON.stringify({ avatar: imageUrl })
                });
                const updateData = await updateRes.json();

                if (updateData.success) {
                    setCurrentUser(prev => ({ ...prev, avatar: imageUrl }));
                    Alert.alert("Success", "Profile picture updated");
                }
            } catch (error) {
                console.error("Upload error", error);
                Alert.alert("Error", "Failed to update profile picture");
            } finally {
                setIsUploading(false);
            }
        });
    };

    if (!currentUser) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {currentUser.avatar ? (
                            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="person" size={60} color="#6C63FF" />
                            </View>
                        )}
                        <TouchableOpacity 
                            style={styles.editAvatarButton}
                            onPress={handleEditAvatar}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Icon name="edit" size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{currentUser.realFullname}</Text>
                    <Text style={styles.username}>@{currentUser.annonymousUsername}</Text>
                    
                    <View style={styles.infoRow}>
                        <Icon name="phone" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{currentUser.phone}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Accept Anonymous Messages</Text>
                            <Text style={styles.settingDescription}>
                                Allow other users to send you message requests
                            </Text>
                        </View>
                        <Switch
                            value={currentUser.acceptMessages}
                            onValueChange={handleToggleMessages}
                            trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                            thumbColor={currentUser.acceptMessages ? "#6C63FF" : "#9CA3AF"}
                            disabled={isToggling}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" size={20} color="#FF4444" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Icon name="delete-forever" size={20} color="#FF4444" />
                        <Text style={styles.deleteText}>Delete Account & Data</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginTop: 16,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2153',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#6C63FF',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 4,
    },
    username: {
        fontSize: 14,
        color: '#6C63FF',
        marginBottom: 12,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8FAFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 12,
        marginLeft: 4,
    },
    settingItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 18,
    },
    logoutButton: {
        backgroundColor: '#FFF5F5',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF4444',
    },
    deleteButton: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FF4444',
    },
});

export default Profile