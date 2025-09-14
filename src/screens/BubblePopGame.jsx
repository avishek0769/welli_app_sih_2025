import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    SafeAreaView,
    Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native'; // Add this import

const { width, height } = Dimensions.get('window');
const BUBBLE_SIZE = 60;
const GAME_AREA_HEIGHT = height * 0.7;

// Difficulty Selection Modal
const DifficultyModal = ({ visible, onSelectDifficulty, onClose }) => {
    if (!visible) return null;

    const difficulties = [
        {
            level: 'easy',
            title: 'Easy',
            description: 'Slow bubbles, more time to think',
            color: '#96CEB4',
            icon: 'child-care',
            bubbleSpeed: 1000,
            maxBubbles: 6,
            gameTime: 45,
        },
        {
            level: 'medium',
            title: 'Medium',
            description: 'Moderate pace, good challenge',
            color: '#45B7D1',
            icon: 'sports-esports',
            bubbleSpeed: 700,
            maxBubbles: 8,
            gameTime: 30,
        },
        {
            level: 'hard',
            title: 'Hard',
            description: 'Fast bubbles, quick reflexes needed',
            color: '#FFEAA7',
            icon: 'local-fire-department',
            bubbleSpeed: 400,
            maxBubbles: 12,
            gameTime: 20,
        },
        {
            level: 'extreme',
            title: 'Extreme',
            description: 'Lightning fast! Can you keep up?',
            color: '#FF6B9D',
            icon: 'flash-on',
            bubbleSpeed: 250,
            maxBubbles: 15,
            gameTime: 15,
        },
    ];

    return (
        <View style={styles.modalOverlay}>
            <MotiView
                from={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 250 }}
                style={styles.difficultyModalContainer}
            >
                <View style={styles.difficultyHeader}>
                    <Text style={styles.difficultyTitle}>Choose Difficulty</Text>
                    <Text style={styles.difficultySubtitle}>
                        Select your challenge level
                    </Text>
                </View>

                <View style={styles.difficultyGrid}>
                    {difficulties.map((difficulty, index) => (
                        <MotiView
                            key={difficulty.level}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ delay: index * 50, type: 'timing', duration: 200 }}
                            style={styles.difficultyCardWrapper}
                        >
                            <TouchableOpacity
                                style={[styles.difficultyCard, { borderColor: difficulty.color }]}
                                onPress={() => onSelectDifficulty(difficulty)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.difficultyIconContainer, { backgroundColor: difficulty.color }]}>
                                    <Icon name={difficulty.icon} size={24} color="#FFFFFF" />
                                </View>
                                
                                <View style={styles.difficultyCardContent}>
                                    <Text style={styles.difficultyCardTitle}>{difficulty.title}</Text>
                                    <Text style={styles.difficultyCardDescription}>
                                        {difficulty.description}
                                    </Text>
                                    
                                    <View style={styles.difficultyStatsContainer}>
                                        <View style={styles.statBadge}>
                                            <Icon name="timer" size={12} color="#6B7280" />
                                            <Text style={styles.statBadgeText}>{difficulty.gameTime}s</Text>
                                        </View>
                                        <View style={styles.statBadge}>
                                            <Icon name="bubble-chart" size={12} color="#6B7280" />
                                            <Text style={styles.statBadgeText}>{difficulty.maxBubbles} max</Text>
                                        </View>
                                    </View>
                                </View>

                                <Icon name="chevron-right" size={18} color={difficulty.color} />
                            </TouchableOpacity>
                        </MotiView>
                    ))}
                </View>

                <TouchableOpacity style={styles.closeDifficultyButton} onPress={onClose}>
                    <Icon name="close" size={16} color="#6B7280" />
                    <Text style={styles.closeDifficultyText}>Cancel</Text>
                </TouchableOpacity>
            </MotiView>
        </View>
    );
};

// Custom Game Over Modal Component
const GameOverModal = ({ visible, score, difficulty, onPlayAgain, onClose }) => {
    if (!visible) return null;

    return (
        <View style={styles.modalOverlay}>
            <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                style={styles.modalContainer}
            >
                <MotiView
                    from={{ translateY: -20, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: 200 }}
                >
                    <Text style={styles.modalTitle}>Game Over! 🎉</Text>
                </MotiView>
                
                <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 400 }}
                    style={styles.scoreCircle}
                >
                    <Text style={styles.modalScore}>{score}</Text>
                    <Text style={styles.modalScoreLabel}>Points</Text>
                </MotiView>

                <MotiView
                    from={{ translateY: 20, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: 600 }}
                >
                    <Text style={styles.modalMessage}>
                        Great job on {difficulty?.title || 'this'} difficulty!{'\n'}
                        You popped bubbles and relaxed your mind.{'\n'}
                        Feeling more refreshed?
                    </Text>
                </MotiView>

                <MotiView
                    from={{ translateY: 30, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ delay: 800 }}
                    style={styles.modalButtons}
                >
                    <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
                        <Icon name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.playAgainText}>Play Again</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                        <Text style={styles.closeModalText}>Close</Text>
                    </TouchableOpacity>
                </MotiView>
            </MotiView>
        </View>
    );
};

const BubblePopGame = () => {
    const navigation = useNavigation(); // Add this line
    
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(false); // Start as false
    const [timeLeft, setTimeLeft] = useState(30);
    const [poppedBubbles, setPoppedBubbles] = useState(new Set());
    const [showGameOver, setShowGameOver] = useState(false);
    const [showDifficulty, setShowDifficulty] = useState(true); // Show difficulty first
    const [currentDifficulty, setCurrentDifficulty] = useState(null);
    
    const gameTimerRef = useRef(null);
    const bubbleTimerRef = useRef(null);

    // Generate random bubble with position validation
    const generateBubble = () => {
        let attempts = 0;
        let newBubble;
        
        do {
            newBubble = {
                id: Date.now() + Math.random(),
                x: Math.random() * (width - BUBBLE_SIZE - 40) + 20,
                y: Math.random() * (GAME_AREA_HEIGHT - BUBBLE_SIZE - 100) + 50,
                color: ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)],
                isPopping: false,
            };
            attempts++;
        } while (attempts < 10); // Prevent infinite loop

        return newBubble;
    };

    // Pop bubble with immediate feedback
    const popBubble = (bubble) => {
        // Immediate feedback - mark as popping
        setPoppedBubbles(prev => new Set([...prev, bubble.id]));
        
        // Haptic feedback - adjust intensity based on difficulty
        const vibrationIntensity = currentDifficulty?.level === 'extreme' ? 30 : 50;
        Vibration.vibrate(vibrationIntensity);
        
        // Remove bubble immediately and update score
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        
        // Score multiplier based on difficulty
        const scoreMultiplier = {
            easy: 5,
            medium: 10,
            hard: 15,
            extreme: 25
        };
        setScore(prev => prev + (scoreMultiplier[currentDifficulty?.level] || 10));

        // Clean up popped bubbles set after animation
        const cleanupTime = currentDifficulty?.level === 'extreme' ? 100 : 200;
        setTimeout(() => {
            setPoppedBubbles(prev => {
                const newSet = new Set(prev);
                newSet.delete(bubble.id);
                return newSet;
            });
        }, cleanupTime);
    };

    // Handle difficulty selection
    const handleDifficultySelect = (difficulty) => {
        setCurrentDifficulty(difficulty);
        setTimeLeft(difficulty.gameTime);
        setShowDifficulty(false);
        setGameActive(true);
    };

    // Start game
    useEffect(() => {
        if (gameActive && currentDifficulty) {
            // Game timer
            gameTimerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Bubble generation based on difficulty
            bubbleTimerRef.current = setInterval(() => {
                setBubbles(prev => {
                    if (prev.length < currentDifficulty.maxBubbles) {
                        return [...prev, generateBubble()];
                    }
                    return prev;
                });
            }, currentDifficulty.bubbleSpeed);
        }

        return () => {
            clearInterval(gameTimerRef.current);
            clearInterval(bubbleTimerRef.current);
        };
    }, [gameActive, currentDifficulty]);

    // Game over effect
    useEffect(() => {
        if (!gameActive && timeLeft === 0 && currentDifficulty) {
            setTimeout(() => {
                setShowGameOver(true);
            }, 1000); // Delay to show final score animation
        }
    }, [gameActive, timeLeft, currentDifficulty]);

    const restartGame = () => {
        setBubbles([]);
        setPoppedBubbles(new Set());
        setScore(0);
        setTimeLeft(currentDifficulty?.gameTime || 30);
        setGameActive(true);
        setShowGameOver(false);
    };

    const handleCloseGame = () => {
        // Reset all game states
        setBubbles([]);
        setPoppedBubbles(new Set());
        setScore(0);
        setTimeLeft(30);
        setGameActive(false);
        setShowGameOver(false);
        setShowDifficulty(true);
        setCurrentDifficulty(null);
        
        // Clear any running timers
        if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
        }
        if (bubbleTimerRef.current) {
            clearInterval(bubbleTimerRef.current);
        }
        
        // Navigate back - adjust this based on your navigation setup
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Fallback navigation - adjust the screen name as needed
            navigation.navigate('Resources');
        }
    };

    const handlePlayAgain = () => {
        setShowGameOver(false);
        setShowDifficulty(true);
        setBubbles([]);
        setPoppedBubbles(new Set());
        setScore(0);
        setGameActive(false);
    };

    return (
        <SafeAreaView style={styles.gameContainer}>
            {/* Game Header */}
            <View style={styles.gameHeader}>
                <TouchableOpacity onPress={handleCloseGame} style={styles.closeGameButton}>
                    <Icon name="close" size={24} color="#6C63FF" />
                </TouchableOpacity>
                <Text style={styles.gameTitle}>
                    Bubble Pop Therapy {currentDifficulty && `- ${currentDifficulty.title}`}
                </Text>
                <TouchableOpacity onPress={handlePlayAgain} style={styles.restartButton}>
                    <Icon name="refresh" size={24} color="#6C63FF" />
                </TouchableOpacity>
            </View>

            {/* Game Stats */}
            {currentDifficulty && (
                <MotiView 
                    style={styles.gameStats}
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Score</Text>
                        <MotiView
                            key={score}
                            from={{ scale: 1.2, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 12, duration: 200 }}
                        >
                            <Text style={styles.statValue}>{score}</Text>
                        </MotiView>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Time</Text>
                        <MotiView
                            animate={{ 
                                scale: timeLeft <= 10 ? [1, 1.08, 1] : 1,
                            }}
                            transition={{ 
                                type: 'timing', 
                                duration: timeLeft <= 10 ? 300 : 0,
                                loop: timeLeft <= 10
                            }}
                        >
                            <Text style={[styles.statValue, { color: timeLeft <= 10 ? '#FF4444' : '#6C63FF' }]}>
                                {timeLeft}s
                            </Text>
                        </MotiView>
                    </View>
                </MotiView>
            )}

            {/* Game Area */}
            <View style={styles.gameArea}>
                {bubbles.map((bubble, index) => {
                    const animationDuration = currentDifficulty?.level === 'extreme' ? 100 : 
                                           currentDifficulty?.level === 'hard' ? 200 : 300;
                    
                    return (
                        <MotiView
                            key={bubble.id}
                            from={{ 
                                scale: 0,
                                opacity: 0,
                                rotate: '0deg'
                            }}
                            animate={{ 
                                scale: poppedBubbles.has(bubble.id) ? 0 : 1,
                                opacity: poppedBubbles.has(bubble.id) ? 0 : 1,
                                rotate: poppedBubbles.has(bubble.id) ? '180deg' : '0deg'
                            }}
                            transition={{ 
                                type: 'spring', 
                                damping: currentDifficulty?.level === 'extreme' ? 25 : 18,
                                stiffness: currentDifficulty?.level === 'extreme' ? 400 : 300,
                                duration: poppedBubbles.has(bubble.id) ? 50 : animationDuration
                            }}
                            style={[
                                styles.bubble,
                                {
                                    left: bubble.x,
                                    top: bubble.y,
                                    backgroundColor: bubble.color,
                                }
                            ]}
                        >
                            {/* Floating animation for bubble */}
                            <MotiView
                                from={{ translateY: 0 }}
                                animate={{ 
                                    translateY: currentDifficulty?.level === 'extreme' ? [-5, 5, -5] : [-3, 3, -3]
                                }}
                                transition={{
                                    type: 'timing',
                                    duration: currentDifficulty?.level === 'extreme' ? 
                                             800 + (index * 50) : 1500 + (index * 100),
                                    loop: true,
                                    repeatReverse: true,
                                }}
                                style={styles.bubbleInner}
                            >
                                <TouchableOpacity
                                    style={styles.bubbleTouchable}
                                    onPress={() => popBubble(bubble)}
                                    activeOpacity={0.8}
                                    disabled={poppedBubbles.has(bubble.id)}
                                >
                                    {/* Bubble shine effect */}
                                    <MotiView
                                        from={{ opacity: 0.4 }}
                                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                                        transition={{
                                            type: 'timing',
                                            duration: currentDifficulty?.level === 'extreme' ? 800 : 1200,
                                            loop: true,
                                            repeatReverse: true,
                                        }}
                                        style={styles.bubbleShine}
                                    />
                                </TouchableOpacity>
                            </MotiView>
                        </MotiView>
                    );
                })}
            </View>

            {/* Instructions */}
            {currentDifficulty && (
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 }}
                    style={styles.instructionsContainer}
                >
                    <Text style={styles.instructions}>
                        {currentDifficulty.level === 'extreme' ? 
                         'Lightning speed mode! Tap as fast as you can! ⚡' :
                         'Tap the colorful bubbles to pop them and reduce stress! 🫧'
                        }
                    </Text>
                </MotiView>
            )}

            {/* Difficulty Selection Modal */}
            <DifficultyModal
                visible={showDifficulty}
                onSelectDifficulty={handleDifficultySelect}
                onClose={handleCloseGame}
            />

            {/* Custom Game Over Modal */}
            <GameOverModal
                visible={showGameOver}
                score={score}
                difficulty={currentDifficulty}
                onPlayAgain={handlePlayAgain}
                onClose={handleCloseGame}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
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
        backgroundColor: '#E8F4F8',
        position: 'relative',
        overflow: 'hidden',
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
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    bubbleInner: {
        width: '100%',
        height: '100%',
        borderRadius: BUBBLE_SIZE / 2,
        position: 'relative',
        overflow: 'hidden',
    },
    bubbleTouchable: {
        width: '100%',
        height: '100%',
        borderRadius: BUBBLE_SIZE / 2,
    },
    bubbleShine: {
        position: 'absolute',
        top: 8,
        left: 12,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    instructionsContainer: {
        backgroundColor: '#FFFFFF',
    },
    instructions: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    // Difficulty Modal Styles
    difficultyModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: width * 0.92,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    difficultyHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    difficultyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2153',
        textAlign: 'center',
        marginBottom: 6,
    },
    difficultySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    difficultyGrid: {
        gap: 12,
        marginBottom: 20,
    },
    difficultyCardWrapper: {
        width: '100%',
    },
    difficultyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1.5,
        borderColor: '#E8F0FF',
    },
    difficultyIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    difficultyCardContent: {
        flex: 1,
    },
    difficultyCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 3,
    },
    difficultyCardDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 8,
    },
    difficultyStatsContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 3,
    },
    statBadgeText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
    },
    closeDifficultyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E8F0FF',
        backgroundColor: '#F8FAFF',
        gap: 6,
        alignSelf: 'center',
    },
    closeDifficultyText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },

    // Custom Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        maxWidth: width * 0.85,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 24,
        textAlign: 'center',
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalScore: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalScoreLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E8F0FF',
        marginTop: 4,
    },
    modalMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    playAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    playAgainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeModalButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#E8F0FF',
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default BubblePopGame;