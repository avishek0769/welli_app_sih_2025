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
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get("window");

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

/* ---------- Enhanced Chart Component with Gifted Charts ---------- */
const MoodChart = ({ data }) => {
    // Convert mood data to chart format
    const chartData = data.map((point) => ({
        value: point.y,
        label: point.x,
        dataPointText: point.y.toString(),
    }));

    // Mood labels for Y-axis
    const moodLabels = {
        5: 'Happy',
        4: 'Good',
        3: 'Okay',
        2: 'Low',
        1: 'Upset'
    };

    return (
        <View style={styles.chartWrapper}>
            <LineChart
                data={chartData}
                width={width - 100}
                height={180}
                spacing={45}
                color="#6C63FF"
                thickness={2}
                dataPointsColor="#6C63FF"
                dataPointsRadius={4}
                textColor="#666"
                textShiftY={-8}
                textShiftX={0}
                textFontSize={9}
                showVerticalLines={false}
                rulesColor="#E0E7FF"
                rulesType="solid"
                initialSpacing={10}
                endSpacing={10}
                maxValue={5}
                minValue={1}
                noOfSections={5}
                yAxisTextStyle={{ color: '#666', fontSize: 9 }}
                xAxisTextNumberOfLines={1}
                curved={false}
                animateOnDataChange={true}
                animationDuration={800}
                onDataChangeAnimationDuration={300}
                isAnimated={true}
                hideDataPoints={false}
                showDataPointOnPress={true}
                pressEnabled={true}
                showStripOnPress={true}
                stripColor="#6C63FF"
                stripOpacity={0.2}
                stripWidth={2}
                formatYLabel={(value) => {
                    return moodLabels[Math.round(value)] || '';
                }}
                yAxisLabelSuffix=""
                hideYAxisText={false}
                yAxisOffset={0}
                backgroundColor="transparent"
                focusEnabled={true}
                showDataPointLabelOnFocus={true}
                dataPointLabelComponent={(item, index) => {
                    return (
                        <View style={styles.dataPointLabel}>
                            <Text style={styles.dataPointLabelText}>
                                {moodLabels[item.value] || item.value}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

/* ---------- AnimatedButton Component ---------- */
const AnimatedButton = ({ children, onPress, style, isActive }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    useEffect(() => {
        if (isActive) {
            Animated.spring(scaleValue, {
                toValue: 1.05,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, scaleValue]);

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: isActive ? 1.05 : 1,
            useNativeDriver: true,
            tension: 300,
            friction: 10,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
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
            setTimeout(() => {
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
                                Thanks for sharing how you feel today
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
                    <Text style={styles.chartTitle}>30-Day Mood Trend</Text>
                </View>
                <MoodChart data={trendData} />
            </View>
        </>
    );
};

/* ---------- QuickAccessTile Component - Enhanced ---------- */
const QuickAccessTile = ({ label, onPress, iconName, description }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tileCard}
        >
            <View style={styles.tileHeader}>
                <View style={styles.tileIcon}>
                    <Icon name={iconName} size={22} color="#6C63FF" />
                </View>
                <View style={styles.tileArrow}>
                    <Icon name="arrow-forward-ios" size={12} color="#9CA3AF" />
                </View>
            </View>
            <Text style={styles.tileLabel}>{label}</Text>
            <Text style={styles.tileDescription}>{description}</Text>
        </TouchableOpacity>
    );
};

// Update the quickTiles data to remove colors
const quickTiles = [
    { 
        id: "ai", 
        label: "AI Chat Support", 
        icon: "chat", 
        description: "Get instant mental health support and guidance from our AI assistant available 24/7"
    },
    { 
        id: "book", 
        label: "Book a Counselor", 
        icon: "calendar-today", 
        description: "Schedule professional counseling sessions with licensed therapists and mental health experts"
    },
    { 
        id: "well", 
        label: "Wellness Hub", 
        icon: "spa", 
        description: "Access curated content including meditation, breathing exercises, and relaxation techniques"
    },
    { 
        id: "peer", 
        label: "Peer Support", 
        icon: "group", 
        description: "Connect with others facing similar challenges in a safe, supportive community environment"
    },
];

/* ---------- SuggestionsCard Component - Simplified ---------- */
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

    useEffect(() => {
        const t = setInterval(() => {
            setCurrent((prev) => {
                const next = suggestions[(suggestions.indexOf(prev) + 1) % suggestions.length];
                return next;
            });
        }, 8000);
        return () => clearInterval(t);
    }, []);

    return (
        <View style={[styles.sectionCard, { flexDirection: "row", alignItems: "center" }]}>
            <Image source={{ uri: current.thumbnail }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>Suggested for you</Text>
                <Text style={styles.cardSubtitle}>{current.title}</Text>
            </View>
        </View>
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

    // Generate last 30 days mood trend data
    const trendData = useMemo(() => {
        const data = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Format date as MM/DD for better readability
            const label = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

            // Generate random mood data with some pattern
            const baseValue = 3;
            const variation = Math.sin(i * 0.1) * 0.8 + (Math.random() - 0.5) * 1.2;
            const mood = Math.max(1, Math.min(5, Math.round(baseValue + variation)));

            data.push({ x: label, y: mood });
        }

        return data;
    }, []);

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
                            <View style={styles.sectionHeaderContainer}>
                                {/* <View style={styles.sectionHeaderIcon}>
                                    <Icon name="dashboard" size={18} color="#6C63FF" />
                                </View> */}
                                <Text style={styles.sectionHeading}>Quick Access</Text>
                            </View>
                            <View style={styles.grid}>
                                {quickTiles.map((t) => (
                                    <QuickAccessTile
                                        key={t.id}
                                        label={t.label}
                                        iconName={t.icon}
                                        description={t.description}
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

    sectionHeading: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2153",
        letterSpacing: 0.3,
        flex: 1,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    sectionHeaderIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    tileCard: {
        width: (width - 56) / 2,
        borderRadius: 20,
        padding: 18,
        paddingBottom: 12,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#F0F4FF",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        alignItems: "flex-start",
        position: 'relative',
        minHeight: 140, // Added minimum height to accommodate description
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    },
    tileIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#F0F4FF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    tileArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#F8FAFF",
        alignItems: "center",
        justifyContent: "center",
    },
    tileLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1F2153",
        marginBottom: 8,
        letterSpacing: 0.2,
        lineHeight: 20,
    },
    tileDescription: {
        fontSize: 11,
        fontWeight: "500",
        color: "#6B7280",
        lineHeight: 16,
        letterSpacing: 0.1,
        textAlign: 'left',
    },

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

    // Enhanced Chart Styles
    chartWrapper: {
        alignItems: 'center',
        paddingVertical: 10,
        marginLeft: -12,
        position: 'relative',
    },
    dataPointLabel: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: -25,
    },
    dataPointLabelText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '600',
    },
});