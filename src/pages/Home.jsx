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
                    <Icon name="psychology" size={24} color="#6C63FF" />
                </View>
                <Text style={styles.appName}>MindCare</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
                <View style={styles.profileIcon}>
                    <Icon name="person" size={20} color="#6C63FF" />
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
    return (
        <View style={styles.section}>
            <Text style={styles.greeting}>Good Evening 🌙, how was your mood today?</Text>

            <View style={styles.moodRow}>
                {moodEmojis.map((emo, i) => {
                    const idx = i + 1;
                    return (
                        <AnimatedButton
                            key={emo}
                            onPress={() => onSelect(idx)}
                            isActive={value === idx}
                            style={[
                                styles.moodButton,
                                value === idx ? styles.moodButtonActive : undefined,
                            ]}
                        >
                            <Text style={styles.moodEmoji}>{emo}</Text>
                        </AnimatedButton>
                    );
                })}
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>7-Day Mood Trend</Text>
                <SimpleChart data={trendData} />
            </View>
        </View>
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
    
    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appLogo: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F0F7FF",
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    appName: {
        fontSize: 18,
        fontWeight: '700',
        color: "#1F2153",
    },
    profileButton: {
        padding: 4,
    },
    profileIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F0F7FF",
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Existing styles
    section: { marginBottom: 12 },
    greeting: { fontSize: 20, fontWeight: "700", color: "#1F2153", marginBottom: 12 },
    moodRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    moodButton: {
        width: (width - 64) / 5,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    moodButtonActive: {
        backgroundColor: "#EEF7FF",
        borderWidth: 1,
        borderColor: "#CDE9FF",
    },
    moodEmoji: { fontSize: 22 },
    chartCard: {
        marginTop: 6,
        borderRadius: 18,
        padding: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2E3057",
        marginBottom: 12,
        textAlign: "center",
    },
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
});