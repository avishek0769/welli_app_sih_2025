import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const BreathingExercise = ({ onClose }) => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('ready'); // 'ready', 'breathe in', 'hold', 'breathe out'
    const [count, setCount] = useState(4);
    const [cycle, setCycle] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const opacityAnim = useRef(new Animated.Value(0.4)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let interval;
        
        if (isActive) {
            interval = setInterval(() => {
                setTotalTime(prev => prev + 1);
                setCount(prevCount => {
                    if (prevCount <= 1) {
                        if (phase === 'breathe in') {
                            setPhase('hold');
                            return 4;
                        } else if (phase === 'hold') {
                            setPhase('breathe out');
                            return 4;
                        } else {
                            setPhase('breathe in');
                            setCycle(prev => prev + 1);
                            return 4;
                        }
                    }
                    return prevCount - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, phase]);

    useEffect(() => {
        if (isActive) {
            // Reset progress animation
            progressAnim.setValue(0);
            
            if (phase === 'breathe in') {
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.8,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: false,
                    }),
                ]).start();
            } else if (phase === 'hold') {
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: false,
                }).start();
            } else if (phase === 'breathe out') {
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 0.6,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.3,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(progressAnim, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: false,
                    }),
                ]).start();
            }
        }
    }, [phase, isActive]);

    // Pulse animation for ready state
    useEffect(() => {
        if (!isActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.03,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isActive]);

    const startExercise = () => {
        setIsActive(true);
        setPhase('breathe in');
        setCount(4);
        setCycle(0);
        setTotalTime(0);
    };

    const stopExercise = () => {
        setIsActive(false);
        setPhase('ready');
        setCount(4);
        scaleAnim.setValue(0.6);
        opacityAnim.setValue(0.4);
        progressAnim.setValue(0);
    };

    const getPhaseInfo = () => {
        switch (phase) {
            case 'breathe in': 
                return { 
                    color: '#4ECDC4', 
                    instruction: 'Breathe In', 
                    description: 'Slowly fill your lungs'
                };
            case 'hold': 
                return { 
                    color: '#FFEAA7', 
                    instruction: 'Hold', 
                    description: 'Keep the air in your lungs'
                };
            case 'breathe out': 
                return { 
                    color: '#45B7D1', 
                    instruction: 'Breathe Out', 
                    description: 'Slowly release the air'
                };
            default: 
                return { 
                    color: '#6C63FF', 
                    instruction: 'Get Ready', 
                    description: 'Tap start to begin'
                };
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const phaseInfo = getPhaseInfo();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <Text style={styles.title}>Breathing Exercise</Text>
                <TouchableOpacity style={styles.infoButton}>
                    <Icon name="info-outline" size={20} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Cycles</Text>
                    <Text style={styles.statValue}>{cycle}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Time</Text>
                    <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Phase</Text>
                    <Text style={[styles.statValue, { color: phaseInfo.color }]}>
                        {phase === 'ready' ? 'Ready' : phase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                </View>
            </View>

            {/* Main Breathing Circle */}
            <View style={styles.breathingArea}>
                <View style={styles.breathingCircleContainer}>
                    {/* Outer glow rings */}
                    <View style={[styles.glowRing, styles.glowRing1, { borderColor: phaseInfo.color + '20' }]} />
                    <View style={[styles.glowRing, styles.glowRing2, { borderColor: phaseInfo.color + '15' }]} />
                    <View style={[styles.glowRing, styles.glowRing3, { borderColor: phaseInfo.color + '10' }]} />
                    
                    {/* Progress Ring */}
                    <View style={styles.progressRingContainer}>
                        <Animated.View 
                            style={[
                                styles.progressRing,
                                {
                                    borderColor: phaseInfo.color,
                                    transform: [{
                                        rotate: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }
                            ]}
                        />
                    </View>

                    {/* Main breathing circle */}
                    <Animated.View
                        style={[
                            styles.breathingCircle,
                            {
                                backgroundColor: phaseInfo.color,
                                transform: [
                                    { scale: isActive ? scaleAnim : pulseAnim }
                                ],
                                opacity: opacityAnim,
                                shadowColor: phaseInfo.color,
                            }
                        ]}
                    />
                    
                    {/* Center content */}
                    <View style={styles.centerContent}>
                        <Text style={styles.counter}>{count}</Text>
                        <Text style={styles.instruction}>
                            {phaseInfo.instruction}
                        </Text>
                        <Text style={styles.description}>
                            {phaseInfo.description}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                {!isActive ? (
                    <TouchableOpacity style={styles.startButton} onPress={startExercise}>
                        <View style={styles.buttonIconContainer}>
                            <Icon name="play-arrow" size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.startButtonText}>Start Exercise</Text>
                            <Text style={styles.startButtonSubtext}>Begin your breathing journey</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.activeControls}>
                        <TouchableOpacity style={styles.pauseButton} onPress={stopExercise}>
                            <Icon name="pause" size={24} color="#6C63FF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopButton} onPress={stopExercise}>
                            <Icon name="stop" size={24} color="#FFFFFF" />
                            <Text style={styles.stopButtonText}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Technique Info */}
            <View style={styles.techniqueCard}>
                <View style={styles.techniqueHeader}>
                    <Icon name="spa" size={20} color="#6C63FF" />
                    <Text style={styles.techniqueTitle}>4-4-4 Box Breathing</Text>
                </View>
                <Text style={styles.techniqueDescription}>
                    This technique helps regulate your nervous system and reduce stress. 
                    Follow the circle's rhythm for the best results.
                </Text>
                
                <View style={styles.benefitsContainer}>
                    <View style={styles.benefit}>
                        <Icon name="favorite" size={16} color="#FF6B9D" />
                        <Text style={styles.benefitText}>Reduces anxiety</Text>
                    </View>
                    <View style={styles.benefit}>
                        <Icon name="psychology" size={16} color="#4ECDC4" />
                        <Text style={styles.benefitText}>Improves focus</Text>
                    </View>
                    <View style={styles.benefit}>
                        <Icon name="nights-stay" size={16} color="#45B7D1" />
                        <Text style={styles.benefitText}>Better sleep</Text>
                    </View>
                </View>
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2153',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E8F0FF',
        marginHorizontal: 16,
    },
    breathingArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    breathingCircleContainer: {
        width: 280,
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        borderRadius: 200,
        borderWidth: 1,
    },
    glowRing1: {
        width: 280,
        height: 280,
    },
    glowRing2: {
        width: 320,
        height: 320,
    },
    glowRing3: {
        width: 360,
        height: 360,
    },
    progressRingContainer: {
        position: 'absolute',
        width: 240,
        height: 240,
    },
    progressRing: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    breathingCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        position: 'absolute',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 180,
        height: 180,
        zIndex: 10,
    },
    counter: {
        fontSize: 48,
        fontWeight: '800',
        color: '#1F2153',
        marginBottom: 4,
        textAlign: 'center',
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    instruction: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        color: '#1F2153',
        marginBottom: 2,
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    description: {
        fontSize: 12,
        color: '#4B5563',
        textAlign: 'center',
        fontWeight: '500',
        textShadowColor: '#FFFFFF',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    controlsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    buttonTextContainer: {
        flex: 1,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    startButtonSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    activeControls: {
        flexDirection: 'row',
        gap: 12,
    },
    pauseButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#6C63FF',
    },
    stopButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF4444',
        borderRadius: 16,
        paddingVertical: 16,
        gap: 8,
    },
    stopButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    techniqueCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    techniqueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    techniqueTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
    },
    techniqueDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    benefitsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    benefit: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    benefitText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default BreathingExercise;