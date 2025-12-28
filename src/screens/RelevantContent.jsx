import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    ActivityIndicator,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';
import { useNavigation } from '@react-navigation/native';

const RelevantContent = ({ onClose }) => {
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const navigation = useNavigation();

    const formatViews = (views) => {
        if (!views) return '0';
        const num = parseInt(views);
        if (isNaN(num)) return views;
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            
            // Fetch videos from backend
            const response = await fetch(`${BASE_URL}/api/v1/user/video-recommendation`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.data) {
                setVideos(data.data);
            }

        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const handleVideoPress = async (videoUrl) => {
        try {
            await Linking.openURL(videoUrl);
        } catch (error) {
            console.log('Error opening video:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Relevant Content</Text>
                    <View style={styles.placeholder} />
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Finding content for you...</Text>
                    <Text style={styles.loadingSubtext}>Our AI is curating personalized recommendations</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <Text style={styles.title}>Relevant Content</Text>
                <TouchableOpacity onPress={fetchRecommendations} style={styles.refreshButton}>
                    <Icon name="refresh" size={20} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <Text style={styles.subtitle}>
                        Personalized videos and articles curated for your wellness journey
                    </Text>
                    <View style={styles.aiTag}>
                        <Icon name="smart-toy" size={16} color="#6C63FF" />
                        <Text style={styles.aiTagText}>AI Curated</Text>
                    </View>
                </MotiView>

                {/* YouTube Videos Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="play-circle-filled" size={24} color="#FF0000" />
                        <Text style={styles.sectionTitle}>Recommended Videos</Text>
                    </View>

                    <View style={styles.videosContainer}>
                        {videos.map((video, index) => (
                            <MotiView
                                key={index}
                                from={{ opacity: 0, translateX: -30 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ 
                                    type: 'timing', 
                                    duration: 400, 
                                    delay: index * 100 
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.videoCard}
                                    onPress={() => handleVideoPress(video.url)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.thumbnailContainer}>
                                        <Image 
                                            source={{ uri: video.thumbnail }}
                                            style={styles.thumbnail}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.durationBadge}>
                                            <Text style={styles.durationText}>{video.duration}</Text>
                                        </View>
                                        <View style={styles.playOverlay}>
                                            <Icon name="play-arrow" size={32} color="#FFFFFF" />
                                        </View>
                                    </View>
                                    
                                    <View style={styles.videoInfo}>
                                        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                                        <View style={styles.videoMeta}>
                                            <Text style={styles.channelName}>{video.channel}</Text>
                                            <Text style={styles.videoViews}>{formatViews(video.views)} views</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </View>
                </View>

                <View style={styles.tipSection}>
                    <Icon name="lightbulb" size={20} color="#6C63FF" />
                    <Text style={styles.tipText}>
                        Content is personalized based on your mental health patterns and preferences
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginTop: 20,
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginVertical: 20,
        lineHeight: 24,
    },
    aiTag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 20,
        gap: 6,
    },
    aiTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C63FF',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    videosContainer: {
        gap: 16,
    },
    videoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    thumbnailContainer: {
        position: 'relative',
        height: 200,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoInfo: {
        padding: 16,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 8,
        lineHeight: 22,
    },
    videoMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    channelName: {
        fontSize: 14,
        color: '#6B7280',
    },
    videoViews: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    articlesContainer: {
        gap: 12,
    },
    articleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    articleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    articleIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F0FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    articleMeta: {
        flex: 1,
    },
    articleSource: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C63FF',
    },
    articleDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    articleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 8,
        lineHeight: 22,
    },
    articleDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    articleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    readTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    readTimeText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    tipSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
});

export default RelevantContent;