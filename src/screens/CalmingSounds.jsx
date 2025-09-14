import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MotiView } from 'moti';

const CalmingSounds = ({ onClose }) => {
    const [playingSound, setPlayingSound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sounds, setSounds] = useState([]);

    // Mock function to simulate fetching sounds from your ML recommendation system
    const fetchRecommendedSounds = async () => {
        setLoading(true);
        
        // Simulate API call delay
        setTimeout(() => {
            // Mock data - replace this with your actual API call
            const recommendedSounds = [
                { id: 1, name: 'Relaxing Audio 1', duration: '10:30' },
                { id: 2, name: 'Peaceful Soundscape', duration: '8:45' },
                { id: 3, name: 'Nature Harmony', duration: '12:15' },
                { id: 4, name: 'Calm Meditation', duration: '15:20' },
                { id: 5, name: 'Tranquil Moments', duration: '9:30' },
                { id: 6, name: 'Serene Journey', duration: '11:45' },
            ];
            
            setSounds(recommendedSounds);
            setLoading(false);
        }, 1500);
    };

    useEffect(() => {
        fetchRecommendedSounds();
    }, []);

    const handleSoundPress = (sound) => {
        if (playingSound === sound.id) {
            setPlayingSound(null);
            // Here you would pause the actual audio
            console.log(`Paused: ${sound.name}`);
        } else {
            setPlayingSound(sound.id);
            // Here you would play the actual audio
            console.log(`Playing: ${sound.name}`);
        }
    };

    const getRandomColor = (index) => {
        const colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80'];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#6C63FF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Calming Sounds</Text>
                    <View style={styles.placeholder} />
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Finding perfect sounds for you...</Text>
                    <Text style={styles.loadingSubtext}>Our AI is personalizing your experience</Text>
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
                <Text style={styles.title}>Calming Sounds</Text>
                <TouchableOpacity onPress={fetchRecommendedSounds} style={styles.refreshButton}>
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
                        Personalized calming sounds recommended just for you
                    </Text>
                    <View style={styles.aiTag}>
                        <Icon name="psychology" size={16} color="#6C63FF" />
                        <Text style={styles.aiTagText}>AI Recommended</Text>
                    </View>
                </MotiView>

                <View style={styles.soundsGrid}>
                    {sounds.map((sound, index) => (
                        <MotiView
                            key={sound.id}
                            from={{ opacity: 0, translateX: -30 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ 
                                type: 'timing', 
                                duration: 400, 
                                delay: index * 100 
                            }}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.soundCard,
                                    playingSound === sound.id && styles.playingSoundCard
                                ]}
                                onPress={() => handleSoundPress(sound)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.soundCardLeft}>
                                    <View style={[
                                        styles.soundWaveIcon, 
                                        { backgroundColor: getRandomColor(index) + '20' }
                                    ]}>
                                        <Icon 
                                            name="graphic-eq" 
                                            size={28} 
                                            color={getRandomColor(index)} 
                                        />
                                    </View>
                                    <View style={styles.soundInfo}>
                                        <Text style={styles.soundName}>{sound.name}</Text>
                                        <Text style={styles.soundDuration}>{sound.duration}</Text>
                                    </View>
                                </View>

                                <View style={styles.soundCardRight}>
                                    {playingSound === sound.id && (
                                        <MotiView
                                            from={{ scale: 0 }}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ 
                                                type: 'timing', 
                                                duration: 1000, 
                                                loop: true 
                                            }}
                                            style={styles.playingIndicator}
                                        >
                                            <View style={styles.waveBar} />
                                            <View style={[styles.waveBar, styles.waveBar2]} />
                                            <View style={[styles.waveBar, styles.waveBar3]} />
                                        </MotiView>
                                    )}
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.playButton,
                                            playingSound === sound.id && styles.pauseButton
                                        ]}
                                        onPress={() => handleSoundPress(sound)}
                                    >
                                        <Icon 
                                            name={playingSound === sound.id ? 'pause' : 'play-arrow'} 
                                            size={20} 
                                            color="#FFFFFF" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </MotiView>
                    ))}
                </View>

                <View style={styles.tipSection}>
                    <Icon name="lightbulb" size={20} color="#6C63FF" />
                    <Text style={styles.tipText}>
                        These sounds are selected based on your preferences and stress patterns
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
    soundsGrid: {
        gap: 12,
    },
    soundCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F4FF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    playingSoundCard: {
        borderColor: '#6C63FF',
        backgroundColor: '#F0F4FF',
        shadowColor: '#6C63FF',
        shadowOpacity: 0.15,
    },
    soundCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    soundWaveIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    soundInfo: {
        flex: 1,
    },
    soundName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 4,
    },
    soundDuration: {
        fontSize: 14,
        color: '#6B7280',
    },
    soundCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playingIndicator: {
        flexDirection: 'row',
        alignItems: 'end',
        gap: 2,
    },
    waveBar: {
        width: 3,
        height: 12,
        backgroundColor: '#6C63FF',
        borderRadius: 2,
    },
    waveBar2: {
        height: 16,
    },
    waveBar3: {
        height: 10,
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    pauseButton: {
        backgroundColor: '#FF4444',
        shadowColor: '#FF4444',
    },
    tipSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
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

export default CalmingSounds;