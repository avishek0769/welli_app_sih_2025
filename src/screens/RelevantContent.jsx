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

const RelevantContent = ({ onClose }) => {
    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState([]);
    const [articles, setArticles] = useState([]);

    // Mock function to simulate fetching recommendations from your ML system
    const fetchRecommendations = async () => {
        setLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            // Mock YouTube videos data - replace with your ML API response
            const mockVideos = [
                {
                    id: 1,
                    title: 'Quick 5-Minute Stress Relief Meditation',
                    thumbnail: 'https://i.ytimg.com/vi/inpok4MKVLM/mqdefault.jpg',
                    duration: '5:23',
                    channelName: 'Mindful Peace',
                    videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
                    views: '2.1M views',
                },
                {
                    id: 2,
                    title: 'Deep Breathing Techniques for Anxiety',
                    thumbnail: 'https://i.ytimg.com/vi/tybOi4hjZFQ/mqdefault.jpg',
                    duration: '8:45',
                    channelName: 'Wellness Hub',
                    videoUrl: 'https://www.youtube.com/watch?v=tybOi4hjZFQ',
                    views: '850K views',
                },
                {
                    id: 3,
                    title: 'Morning Mindfulness Routine',
                    thumbnail: 'https://i.ytimg.com/vi/ZToicYcHIOU/mqdefault.jpg',
                    duration: '12:15',
                    channelName: 'Daily Calm',
                    videoUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
                    views: '1.5M views',
                },
            ];

            // Mock articles data - replace with your ML API response
            const mockArticles = [
                {
                    id: 1,
                    title: 'Understanding Stress: Causes and Solutions',
                    description: 'Learn about the science behind stress and effective ways to manage it in your daily life.',
                    source: 'Mental Health Today',
                    readTime: '6 min read',
                    articleUrl: 'https://example.com/stress-management',
                    publishedDate: '2 days ago',
                },
                {
                    id: 2,
                    title: 'The Power of Mindful Breathing',
                    description: 'Discover how simple breathing techniques can transform your mental well-being.',
                    source: 'Wellness Journal',
                    readTime: '4 min read',
                    articleUrl: 'https://example.com/mindful-breathing',
                    publishedDate: '1 week ago',
                },
                {
                    id: 3,
                    title: 'Sleep Hygiene: Your Guide to Better Rest',
                    description: 'Essential tips and habits for improving your sleep quality and mental health.',
                    source: 'Health & Mind',
                    readTime: '8 min read',
                    articleUrl: 'https://example.com/sleep-hygiene',
                    publishedDate: '3 days ago',
                },
            ];

            setVideos(mockVideos);
            setArticles(mockArticles);
            setLoading(false);
        }, 2000);
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

    const handleArticlePress = async (articleUrl) => {
        try {
            await Linking.openURL(articleUrl);
        } catch (error) {
            console.log('Error opening article:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                                key={video.id}
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
                                    onPress={() => handleVideoPress(video.videoUrl)}
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
                                            <Text style={styles.channelName}>{video.channelName}</Text>
                                            <Text style={styles.videoViews}>{video.views}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </View>
                </View>

                {/* Articles Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="article" size={24} color="#6C63FF" />
                        <Text style={styles.sectionTitle}>Recommended Articles</Text>
                    </View>

                    <View style={styles.articlesContainer}>
                        {articles.map((article, index) => (
                            <MotiView
                                key={article.id}
                                from={{ opacity: 0, translateX: -30 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ 
                                    type: 'timing', 
                                    duration: 400, 
                                    delay: (videos.length * 100) + (index * 100)
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.articleCard}
                                    onPress={() => handleArticlePress(article.articleUrl)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.articleHeader}>
                                        <View style={styles.articleIcon}>
                                            <Icon name="article" size={20} color="#6C63FF" />
                                        </View>
                                        <View style={styles.articleMeta}>
                                            <Text style={styles.articleSource}>{article.source}</Text>
                                            <Text style={styles.articleDate}>{article.publishedDate}</Text>
                                        </View>
                                        <Icon name="open-in-new" size={18} color="#9CA3AF" />
                                    </View>
                                    
                                    <Text style={styles.articleTitle}>{article.title}</Text>
                                    <Text style={styles.articleDescription}>{article.description}</Text>
                                    
                                    <View style={styles.articleFooter}>
                                        <View style={styles.readTimeBadge}>
                                            <Icon name="schedule" size={14} color="#6B7280" />
                                            <Text style={styles.readTimeText}>{article.readTime}</Text>
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