import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const BUBBLE_SIZE = 60;


// Main Resources Component
const Resources = () => {
    const [activeSection, setActiveSection] = useState('games');
    const navigation = useNavigation()

    const gameActivities = [
        {
            id: 1,
            title: 'Bubble Pop Game',
            description: 'Pop colorful bubbles to release stress and anxiety',
            icon: 'games',
            color: '#FF6B9D',
            component: 'BubblePopGame',
        },
        // Add more games here later
    ];

    const contentActivities = [
        {
            id: 1,
            title: 'Calming Sounds',
            description: 'Nature sounds and white noise for relaxation',
            icon: 'music-note',
            color: '#4ECDC4',
            component: 'CalmingSounds',
        },
        {
            id: 2,
            title: 'Breathing Exercise',
            description: 'Guided breathing techniques for instant calm',
            icon: 'air',
            color: '#45B7D1',
            component: 'BreathingExercise',
        },
        {
            id: 3,
            title: 'Recommended for You',
            description: 'AI-powered suggestions tailored to your mental wellness needs',
            icon: 'person',
            color: '#96CEB4',
            component: 'RelevantContent',
        }
    ];

    const handleActivityPress = (activity) => {
        // Navigation logic will go here
        navigation.navigate(activity.component);
    };

    const ActivityCard = ({ activity }) => (
        <TouchableOpacity
            style={[styles.activityCard, { borderLeftColor: activity.color }]}
            onPress={() => handleActivityPress(activity)}
            activeOpacity={0.7}
        >
            <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <Icon name={activity.icon} size={28} color={activity.color} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>Stress Relief Resources</Text>
                    <Text style={styles.subtitle}>
                        Interactive activities to help you relax and unwind
                    </Text>
                </View>

                {/* Section Slider */}
                <View style={styles.sectionSlider}>
                    <TouchableOpacity
                        style={[
                            styles.sectionButton,
                            activeSection === 'games' && styles.activeSectionButton
                        ]}
                        onPress={() => setActiveSection('games')}
                    >
                        <Text style={[
                            styles.sectionButtonText,
                            activeSection === 'games' && styles.activeSectionButtonText
                        ]}>
                            Games
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.sectionButton,
                            activeSection === 'content' && styles.activeSectionButton
                        ]}
                        onPress={() => setActiveSection('content')}
                    >
                        <Text style={[
                            styles.sectionButtonText,
                            activeSection === 'content' && styles.activeSectionButtonText
                        ]}>
                            Content
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Activities List */}
                <ScrollView
                    style={styles.activitiesContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.activitiesContent}
                >
                    <View style={styles.activitiesGrid}>
                        {(activeSection === 'games' ? gameActivities : contentActivities).map(activity => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </View>

                    <View style={styles.tipSection}>
                        <Text style={styles.tipTitle}>💡 Quick Tip</Text>
                        <Text style={styles.tipText}>
                            {activeSection === 'games'
                                ? 'Playing stress-relief games for just 5 minutes can help reset your mind and reduce anxiety levels.'
                                : 'Regular practice of relaxation techniques can significantly improve your overall mental well-being and stress management.'
                            }
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    content: {
        flex: 1,
        paddingBottom: 90,
    },
    headerSection: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    sectionSlider: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        padding: 4,
    },
    sectionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeSectionButton: {
        backgroundColor: '#6C63FF',
    },
    sectionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeSectionButtonText: {
        color: '#FFFFFF',
    },
    activitiesContainer: {
        flex: 1,
    },
    activitiesContent: {
        paddingHorizontal: 16,
    },
    activitiesGrid: {
        gap: 12,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    activityIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    tipSection: {
        backgroundColor: '#E8F0FF',
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        marginBottom: 20,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
    },

    // Game Styles
    gameContainer: {
        flex: 1,
        backgroundColor: '#F0F8FF',
    },
    gameHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    closeGameButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    restartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6C63FF',
    },
    gameArea: {
        flex: 1,
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
    },
    bubble: {
        position: 'absolute',
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: BUBBLE_SIZE / 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    bubbleInner: {
        width: '100%',
        height: '100%',
        borderRadius: BUBBLE_SIZE / 2,
        backgroundColor: 'inherit',
    },
    gameOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameOverText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    finalScoreText: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    instructions: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
});

export default Resources;