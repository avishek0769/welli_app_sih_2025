import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    Animated,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get("window");

const moodEmojis = ["😃", "🙂", "😐", "😔", "😢"];
const pastelColors = ["#E8F8F5", "#EEF7FF", "#F6F0FF", "#F3F7E8"];

/* ---------- Header Component ---------- */
const Header = () => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.appLogo}>
                    <View style={styles.logoGradient}>
                        <Icon name="psychology" size={26} color="#FFFFFF" />
                    </View>
                </View>
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>MindCare</Text>
                    <Text style={styles.appSubtitle}>Your Mental Wellness Companion</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
                <View style={styles.profileIcon}>
                    <Icon name="person" size={22} color="#6C63FF" />
                    <View style={styles.notificationBadge} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

/* ---------- Simple Chart Component ---------- */
const SimpleChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.y));
    const minValue = Math.min(...data.map(d => d.y));
    const range = maxValue - minValue || 1;

    return (
        <View style={styles.simpleChart}>
            <View style={styles.chartContainer}>
                {data.map((point, index) => {
                    const height = ((point.y - minValue) / range) * 60 + 10;
                    return (
                        <View key={index} style={styles.chartPoint}>
                            <View 
                                style={[
                                    styles.chartBar, 
                                    { height, backgroundColor: '#6C63FF' }
                                ]} 
                            />
                            <Text style={styles.chartLabel}>{point.x}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

/* ---------- AnimatedButton Component ---------- */
const AnimatedButton = ({ children, onPress, style, isActive }) => {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.92,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: isActive ? 1.08 : 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};

/* ---------- MoodTracker Component ---------- */
const MoodTracker = ({ value, onSelect, trendData }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const moodIcons = [
        { icon: 'sentiment-very-satisfied', color: '#4CAF50', label: 'Great' },
        { icon: 'sentiment-satisfied', color: '#8BC34A', label: 'Good' },
        { icon: 'sentiment-neutral', color: '#FF9800', label: 'Okay' },
        { icon: 'sentiment-dissatisfied', color: '#FF5722', label: 'Bad' },
        { icon: 'sentiment-very-dissatisfied', color: '#F44336', label: 'Awful' }
    ];

    const handleSubmitMood = () => {
        if (value) {
            setIsSubmitted(true);
            // Add your mood submission logic here
            setTimeout(() => {
                // Reset after 3 seconds for demo purposes
                // setIsSubmitted(false);
            }, 3000);
        }
    };

    const selectedMood = value ? moodIcons[value - 1] : null;

    return (
        <>
            <View style={styles.greetingContainer}>
                <View style={styles.greetingIconWrapper}>
                    <Icon name="nightlight-round" size={24} color="#6C63FF" />
                </View>
                <View style={styles.greetingTextContainer}>
                    {isSubmitted ? (
                        <>
                            <Text style={styles.greeting}>Mood Recorded!</Text>
                            <Text style={styles.greetingSubtext}>
                                Thanks for sharing how you feel today 💜
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.greeting}>Good Evening</Text>
                            <Text style={styles.greetingSubtext}>How was your mood today?</Text>
                        </>
                    )}
                </View>
            </View>

            {isSubmitted ? (
                // Success State UI
                <View style={styles.moodSubmittedContainer}>
                    <View style={styles.submittedMoodDisplay}>
                        <View style={[
                            styles.submittedMoodIcon,
                            { backgroundColor: selectedMood.color + '20' }
                        ]}>
                            <Icon 
                                name={selectedMood.icon} 
                                size={32} 
                                color={selectedMood.color} 
                            />
                        </View>
                        <Text style={[styles.submittedMoodText, { color: selectedMood.color }]}>
                            You're feeling {selectedMood.label} today
                        </Text>
                        <View style={styles.submittedSuccessIcon}>
                            <Icon name="check-circle" size={20} color="#4CAF50" />
                            <Text style={styles.submittedSuccessText}>Saved successfully</Text>
                        </View>
                    </View>
                </View>
            ) : (
                // Mood Selection UI
                <>
                    <View style={styles.moodRow}>
                        {moodIcons.map((moodItem, i) => {
                            const idx = i + 1;
                            const isSelected = value === idx;
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => onSelect(idx)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.moodButton,
                                        isSelected && [styles.moodButtonActive, { borderColor: moodItem.color }]
                                    ]}
                                >
                                    <View style={styles.moodButtonContent}>
                                        <View style={[
                                            styles.moodIconWrapper,
                                            isSelected && { backgroundColor: moodItem.color + '15' }
                                        ]}>
                                            <Icon 
                                                name={moodItem.icon} 
                                                size={24} 
                                                color={isSelected ? moodItem.color : '#9CA3AF'} 
                                            />
                                        </View>
                                        <Text style={[
                                            styles.moodLabel,
                                            isSelected && { color: moodItem.color, fontWeight: '700' }
                                        ]}>
                                            {moodItem.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Submit Button */}
                    <View style={styles.submitButtonContainer}>
                        <TouchableOpacity
                            onPress={handleSubmitMood}
                            activeOpacity={0.8}
                            disabled={!value}
                            style={[
                                styles.submitButton,
                                !value && styles.submitButtonDisabled
                            ]}
                        >
                            <Icon 
                                name="send" 
                                size={18} 
                                color={value ? "#FFFFFF" : "#B0B0B0"} 
                                style={{ marginRight: 8 }}
                            />
                            <Text style={[
                                styles.submitButtonText,
                                !value && styles.submitButtonTextDisabled
                            ]}>
                                Submit Mood
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <Icon name="trending-up" size={20} color="#6C63FF" />
                    <Text style={styles.chartTitle}>7-Day Mood Trend</Text>
                </View>
                <SimpleChart data={trendData} />
            </View>
        </>
    );
};

/* ---------- QuickAccessTile Component ---------- */
const QuickAccessTile = ({ label, color = "#F0F7FF", onPress, iconName }) => {
    const scaleValue = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
        >
            <Animated.View style={[
                styles.tileCard,
                { backgroundColor: color, transform: [{ scale: scaleValue }] }
            ]}>
                <View style={styles.tileIcon}>
                    <Icon name={iconName} size={20} color="#6C63FF" />
                </View>
                <Text style={styles.tileLabel}>{label}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

/* ---------- SuggestionsCard Component ---------- */
const SuggestionsCard = () => {
    const suggestions = [
        {
            id: "1",
            title: "5-min breathing exercise 🌬️",
            thumbnail: "https://i.ytimg.com/vi/1NE9v9x4tG0/maxresdefault.jpg",
        },
        {
            id: "2",
            title: "Mindful body scan (7 mins)",
            thumbnail: "https://i.ytimg.com/vi/2n7oQwZgYVY/maxresdefault.jpg",
        },
    ];

    const [current, setCurrent] = useState(suggestions[0]);
    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        const t = setInterval(() => {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            setCurrent((prev) => {
                const next = suggestions[(suggestions.indexOf(prev) + 1) % suggestions.length];
                return next;
            });
        }, 8000);
        return () => clearInterval(t);
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <View style={[styles.sectionCard, { flexDirection: "row", alignItems: "center" }]}>
                <Image source={{ uri: current.thumbnail }} style={styles.thumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>Suggested for you</Text>
                    <Text style={styles.cardSubtitle}>{current.title}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

/* ---------- BookingStatusCard Component ---------- */
const BookingStatusCard = ({ status, acceptedAt }) => {
    const message =
        status === "Pending"
            ? "Your request is waiting for confirmation."
            : status === "Accepted"
                ? `Session confirmed on ${acceptedAt ?? "—"}.`
                : "Your session is completed. Hope it went well!";

    return (
        <View style={[styles.sectionCard, { backgroundColor: "#F6F9FF" }]}>
            <Text style={styles.cardTitle}>Latest Booking</Text>
            <Text style={styles.cardSubtitle}>{status}</Text>
            <Text style={styles.cardDetail}>{message}</Text>
        </View>
    );
};

/* ---------- HomeScreen (default export) ---------- */
const Home = () => {
    const [todayMood, setTodayMood] = useState(null);
    const [bookingStatus, setBookingStatus] = useState("Pending");
    const [acceptedAt] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toLocaleString();
    });

    const trendData = useMemo(() => {
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return labels.map((l, i) => ({ x: l, y: Math.max(1, Math.min(5, 3 + Math.round(Math.sin(i) - Math.random()))) }));
    }, []);

    const quickTiles = [
        { id: "ai", label: "AI Chat Support", color: "#E8F8F5", icon: "chat" },
        { id: "book", label: "Book a Counselor", color: "#EEF7FF", icon: "calendar-today" },
        { id: "well", label: "Wellness Hub", color: "#F6F0FF", icon: "spa" },
        { id: "peer", label: "Peer Support", color: "#F3F7E8", icon: "group" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                data={[]}
                ListHeaderComponent={
                    <>
                        <MoodTracker value={todayMood} onSelect={setTodayMood} trendData={trendData} />

                        <View style={[styles.section, { marginTop: 12 }]}>
                            <Text style={styles.sectionHeading}>Quick Access</Text>
                            <View style={styles.grid}>
                                {quickTiles.map((t) => (
                                    <QuickAccessTile 
                                        key={t.id} 
                                        label={t.label} 
                                        color={t.color} 
                                        iconName={t.icon}
                                        onPress={() => { }} 
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={[styles.section]}>
                            <Text style={styles.sectionHeading}>Personalized Suggestions</Text>
                            <SuggestionsCard />
                        </View>

                        <View style={[styles.section]}>
                            <Text style={styles.sectionHeading}>Highlights</Text>
                            <BookingStatusCard status={bookingStatus} acceptedAt={bookingStatus === "Accepted" ? acceptedAt : undefined} />
                        </View>
                    </>
                }
                renderItem={() => null}
                ListEmptyComponent={<View />}
            />
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF", marginBottom: 30 },
    
    // Enhanced Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appLogo: {
        marginRight: 16,
    },
    logoGradient: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#6C63FF",
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 3,
        borderColor: "#E8F0FF",
    },
    appInfo: {
        flex: 1,
    },
    appName: {
        fontSize: 22,
        fontWeight: '800',
        color: "#1F2153",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    appSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: "#6C63FF",
        opacity: 0.8,
        letterSpacing: 0.3,
    },
    profileButton: {
        padding: 6,
    },
    profileIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F8FAFF",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: "#E8F0FF",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#FF6B6B",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    
    // Existing styles
    section: { marginBottom: 12 },
    simpleChart: {
        alignItems: "center",
    },
    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 80,
        width: "100%",
    },
    chartPoint: {
        alignItems: "center",
        flex: 1,
    },
    chartBar: {
        width: 20,
        borderRadius: 10,
        marginBottom: 8,
    },
    chartLabel: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },

    sectionHeading: { fontSize: 16, fontWeight: "600", color: "#2E3057", marginBottom: 8 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    tileCard: {
        width: (width - 56) / 2,
        borderRadius: 22,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        alignItems: "flex-start",
    },
    tileIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    tileLabel: { fontSize: 14, fontWeight: "600", color: "#2E3057" },

    sectionCard: {
        borderRadius: 18,
        padding: 12,
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        marginBottom: 12,
    },
    thumb: { width: 96, height: 64, borderRadius: 10, backgroundColor: "#EEE" },
    cardTitle: { fontSize: 13, fontWeight: "700", color: "#2E3057" },
    cardSubtitle: { fontSize: 15, marginTop: 6, color: "#424257", fontWeight: "600" },
    cardDetail: { fontSize: 13, marginTop: 8, color: "#7B7B8A" },

    // Enhanced MoodTracker Styles
    moodSection: { 
        marginBottom: 20,
        backgroundColor: '#FAFBFF',
        borderRadius: 24,
        padding: 20,
        // marginHorizontal: 4,
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    greetingIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#E8F0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    greetingTextContainer: {
        flex: 1,
    },
    greeting: { 
        fontSize: 22, 
        fontWeight: "800", 
        color: "#1F2153", 
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    greetingSubtext: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6C63FF",
        opacity: 0.8,
    },
    moodRow: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    moodButton: {
        width: (width - 80) / 5,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    moodButtonActive: {
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        shadowColor: "#6C63FF",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        transform: [{ scale: 1.05 }],
    },
    moodButtonContent: {
        alignItems: 'center',
    },
    moodIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    chartCard: {
        borderRadius: 20,
        padding: 20,
        backgroundColor: "#FFFFFF",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2153",
        marginLeft: 8,
        letterSpacing: 0.3,
    },

    // Submit Button Styles
    submitButtonContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: '#F0F0F0',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    submitButtonTextDisabled: {
        color: '#B0B0B0',
    },

    // Submitted State Styles
    moodSubmittedContainer: {
        marginBottom: 24,
    },
    submittedMoodDisplay: {
        alignItems: 'center',
        backgroundColor: '#F8FAFF',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    submittedMoodIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    submittedMoodText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    submittedSuccessIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50' + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    submittedSuccessText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 6,
    },
});