import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    Modal,
    Linking,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants';

const { width } = Dimensions.get("window");


const WelcomeSection = () => {
    const getWellnessQuote = () => {
        const quotes = [
            "Your mental health is a priority. Your happiness is essential.",
            "Taking care of yourself is not selfish, it's necessary.",
            "You are stronger than you think and braver than you feel.",
            "Every step forward is progress, no matter how small.",
            "Your mental wellness journey starts with a single step."
        ];
        const today = new Date().getDate();
        return quotes[today % quotes.length];
    };

    return (
        <View style={styles.welcomeContainer}>
            <View style={styles.welcomeCard}>
                <View style={styles.cardIconRow}>
                    <Icon name="psychology" size={20} color="#6C63FF" />
                    <Icon name="spa" size={20} color="#10B981" />
                    <Icon name="group" size={20} color="#F59E0B" />
                    <Icon name="chat" size={20} color="#EF4444" />
                </View>

                <Text style={styles.welcomeTitle}>Welcome to Welli</Text>
                <Text style={styles.welcomeSubtitle}>
                    Your comprehensive mental wellness companion designed to support your emotional well-being every step of the way.
                </Text>

                <View style={styles.featuresRow}>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconSmall}>
                            <Icon name="psychology" size={28} color="#6C63FF" />
                        </View>
                        <Text style={styles.featureText}>AI Support</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconSmall}>
                            <Icon name="emergency" size={28} color="#10B981" />
                        </View>
                        <Text style={styles.featureText}>Expert Counselors</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <View style={styles.featureIconSmall}>
                            <Icon name="group" size={28} color="#F59E0B" />
                        </View>
                        <Text style={styles.featureText}>Peer Community</Text>
                    </View>
                </View>

                <View style={styles.quoteContainer}>
                    <View style={styles.quoteIcon}>
                        <Icon name="format-quote" size={16} color="#6C63FF" />
                    </View>
                    <Text style={styles.quoteText}>{getWellnessQuote()}</Text>
                </View>
            </View>
        </View>
    );
};


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
        description: "Get instant mental health support and guidance from our AI assistant available 24/7",
        screen: "Chatbot"
    },
    {
        id: "book",
        label: "Book a Counselor",
        icon: "calendar-today",
        description: "Schedule professional counseling sessions with licensed therapists and mental health experts",
        screen: "Counseling"
    },
    {
        id: "well",
        label: "Wellness Hub",
        icon: "spa",
        description: "Access curated content including meditation, breathing exercises, and relaxation techniques",
        screen: "Resources"
    },
    {
        id: "peer",
        label: "Peer Support",
        icon: "group",
        description: "Connect with others facing similar challenges in a safe, supportive community environment",
        screen: "PeerSupport"
    },
];

const SuggestionsCard = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const response = await fetch(`${BASE_URL}/api/v1/user/video-recommendation`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.data) {
                setSuggestions(data.data);
            }

        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleVideoPress = async (videoUrl) => {
        try {
            await Linking.openURL(videoUrl);
        } catch (error) {
            console.error('Error opening video:', error);
        }
    };

    const renderSuggestionItem = ({ item, index }) => (
        <TouchableOpacity
            style={[styles.suggestionCard, { marginRight: index === suggestions.length - 1 ? 16 : 12 }]}
            activeOpacity={0.8}
            onPress={() => handleVideoPress(item.url)}
        >
            <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.suggestionThumbnail} />
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                </View>
                <View style={styles.playButton}>
                    <Icon name="play-arrow" size={24} color="#FFFFFF" />
                </View>
            </View>
            <View style={styles.suggestionContent}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.channel}</Text>
                </View>
                <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.suggestionFooter}>
                    <Icon name="open-in-new" size={14} color="#6C63FF" />
                    <Text style={styles.footerText}>Watch on YouTube</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <View style={styles.loadingThumbnail} />
                    <View style={styles.loadingText} />
                    <View style={styles.loadingTextSmall} />
                </View>
                <View style={styles.loadingCard}>
                    <View style={styles.loadingThumbnail} />
                    <View style={styles.loadingText} />
                    <View style={styles.loadingTextSmall} />
                </View>
                <View style={styles.loadingCard}>
                    <View style={styles.loadingThumbnail} />
                    <View style={styles.loadingText} />
                    <View style={styles.loadingTextSmall} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.suggestionsContainer}>
            <FlatList
                data={suggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsList}
            />
        </View>
    );
};

const BookingStatusCard = ({ status, acceptedAt }) => {
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Mock data - replace with actual data from your API
    const bookingData = {
        requestDate: "Dec 14, 2024",
        requestTime: "2:30 PM",
        problemType: "Anxiety & Stress Management",
        counselorName: status === "Accepted" ? "Dr. Sarah Johnson" : status === "Completed" ? "Dr. Sarah Johnson" : null,
        sessionType: "Video Call",
        estimatedDuration: "45 minutes",
        preferredDay: "Monday",
        preferredTiming: "Afternoon",
        // Fixed scheduling details for accepted status
        scheduledDate: "Dec 18, 2024",
        scheduledTime: "3:00 PM",
        scheduledDay: "Wednesday"
    };

    const getStatusColor = () => {
        switch (status) {
            case "Pending":
                return "#FF9800";
            case "Accepted":
                return "#4CAF50";
            case "Completed":
                return "#6C63FF";
            default:
                return "#9CA3AF";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "Pending":
                return "schedule";
            case "Accepted":
                return "check-circle";
            case "Completed":
                return "task-alt";
            default:
                return "help";
        }
    };

    return (
        <View style={styles.bookingCard}>
            {/* Status Header */}
            <View style={styles.bookingHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
                    <Icon name={getStatusIcon()} size={16} color={getStatusColor()} />
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {status}
                    </Text>
                </View>
                <Text style={styles.bookingTitle}>Counseling Session</Text>
            </View>

            {/* Booking Details */}
            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="calendar-today" size={16} color="#6C63FF" />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Requested On</Text>
                        <Text style={styles.detailValue}>
                            {bookingData.requestDate} at {bookingData.requestTime}
                        </Text>
                    </View>
                </View>

                {/* Show different content based on status */}
                {status === "Accepted" || status === "Completed" ? (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Icon name="event-available" size={16} color="#6C63FF" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Scheduled For</Text>
                            <Text style={styles.detailValue}>
                                {bookingData.scheduledDay}, {bookingData.scheduledDate} at {bookingData.scheduledTime}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Icon name="schedule" size={16} color="#6C63FF" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Preferred Day & Time</Text>
                            <Text style={styles.detailValue}>
                                {bookingData.preferredDay}, {bookingData.preferredTiming}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="psychology" size={16} color="#6C63FF" />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Concern Type</Text>
                        <Text style={styles.detailValue}>{bookingData.problemType}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Icon name="videocam" size={16} color="#6C63FF" />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Session Type</Text>
                        <Text style={styles.detailValue}>
                            {bookingData.sessionType} • {bookingData.estimatedDuration}
                        </Text>
                    </View>
                </View>

                {(status === "Accepted" || status === "Completed") && bookingData.counselorName && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Icon name="person" size={16} color="#6C63FF" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Counselor</Text>
                            <Text style={styles.detailValue}>{bookingData.counselorName}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                {status === "Accepted" && (
                    <>
                        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                            <Icon name="calendar-today" size={16} color="#6C63FF" />
                            <Text style={styles.secondaryButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                            <Icon name="videocam" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Join Session</Text>
                        </TouchableOpacity>
                    </>
                )}

                {status === "Completed" && (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={() => setShowBookingModal(true)}
                    >
                        <Icon name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Book Again</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Booking Modal */}
            <BookingModal
                visible={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                counselorName={bookingData.counselorName}
            />
        </View>
    );
};

/* ---------- Booking Modal Component ---------- */
const BookingModal = ({ visible, onClose, counselorName }) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];

    const handleBooking = () => {
        if (selectedDay && selectedTime) {
            // Handle booking logic here
            console.log(`Booking for ${counselorName} on ${selectedDay} ${selectedTime}`);
            onClose();
            // Show success message or navigate to confirmation
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Book Appointment</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.counselorInfo}>
                        <Icon name="person" size={20} color="#6C63FF" />
                        <Text style={styles.counselorName}>with {counselorName}</Text>
                    </View>

                    <Text style={styles.sectionLabel}>Select Preferred Day</Text>
                    <View style={styles.optionsGrid}>
                        {availableDays.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.optionButton,
                                    selectedDay === day && styles.optionButtonSelected
                                ]}
                                onPress={() => setSelectedDay(day)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedDay === day && styles.optionTextSelected
                                ]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionLabel}>Select Time Preference</Text>
                    <View style={styles.timeGrid}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.timeButton,
                                    selectedTime === time && styles.timeButtonSelected
                                ]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text style={[
                                    styles.timeText,
                                    selectedTime === time && styles.timeTextSelected
                                ]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (!selectedDay || !selectedTime) && styles.confirmButtonDisabled
                            ]}
                            onPress={handleBooking}
                            disabled={!selectedDay || !selectedTime}
                        >
                            <Text style={styles.confirmButtonText}>Book Appointment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const Home = () => {
    const [bookingStatus, setBookingStatus] = useState("Pending");
    const navigation = useNavigation();

    const [acceptedAt] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toLocaleString();
    });

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                data={[]}
                ListHeaderComponent={
                    <>
                        <WelcomeSection />

                        <View style={[styles.section, { marginTop: 12 }]}>
                            <Text style={styles.sectionHeading}>Quick Access</Text>
                            <View style={styles.grid}>
                                {quickTiles.map((t) => (
                                    <QuickAccessTile
                                        key={t.id}
                                        label={t.label}
                                        iconName={t.icon}
                                        description={t.description}
                                        onPress={() => navigation.navigate(t.screen)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={[styles.section]}>
                            <Text style={styles.sectionHeading}>Personalized Suggestions</Text>
                            <SuggestionsCard />
                        </View>

                        <View style={[styles.section]}>
                            <View style={styles.sectionWithButton}>
                                <Text style={styles.sectionHeading}>Highlights</Text>
                                <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.8}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                    <Icon name="arrow-forward" size={16} color="#6C63FF" />
                                </TouchableOpacity>
                            </View>
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

// Add these new styles to your existing StyleSheet
const additionalStyles = {
    // Welcome Section Styles
    welcomeContainer: {
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    welcomeBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 24,
    },
    gradientCircle1: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#6C63FF',
        opacity: 0.1,
        top: -30,
        right: -30,
    },
    gradientCircle2: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10B981',
        opacity: 0.08,
        bottom: -20,
        left: -20,
    },
    gradientCircle3: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F59E0B',
        opacity: 0.06,
        top: '50%',
        right: 20,
    },
    welcomeContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#F0F4FF',
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    greetingSection: {
        flex: 1,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2153',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6C63FF',
        opacity: 0.8,
    },
    appIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
    },
    heartbeat: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#6C63FF',
        opacity: 0.3,
    },
    welcomeCard: {
        backgroundColor: '#F8FAFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    cardIconRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2153',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    welcomeSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
        letterSpacing: 0.2,
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIconSmall: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    featureText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    quoteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#6C63FF',
    },
    quoteIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    quoteText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2153',
        lineHeight: 18,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#F8FAFF',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#6C63FF',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E8F0FF',
        marginHorizontal: 8,
    },

    container: { flex: 1, backgroundColor: "#FFFFFF", marginBottom: 30 },

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
        paddingTop: 15
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

    // Enhanced Suggestions Styles
    suggestionsContainer: {
        marginBottom: 8,
        paddingTop: 10,
    },
    suggestionsList: {
        paddingLeft: 0,
        paddingRight: 4,
    },
    suggestionCard: {
        width: 200,
        marginBottom: 10,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F4FF',
        overflow: 'hidden',
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: 110,
    },
    suggestionThumbnail: {
        width: '100%',
        height: '100%',
        backgroundColor: "#F0F4FF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
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
        fontSize: 10,
        fontWeight: '600',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 99, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    suggestionContent: {
        padding: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#6C63FF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2153',
        lineHeight: 18,
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    suggestionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6C63FF',
        marginLeft: 4,
        opacity: 0.8,
    },

    // Loading State Styles
    loadingContainer: {
        flexDirection: 'row',
        paddingRight: 16,
    },
    loadingCard: {
        width: 200,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F0F4FF',
        marginVertical: 10
    },
    loadingThumbnail: {
        width: '100%',
        height: 110,
        backgroundColor: '#F0F4FF',
        borderRadius: 8,
        marginBottom: 12,
    },
    loadingText: {
        height: 14,
        backgroundColor: '#F0F4FF',
        borderRadius: 4,
        marginBottom: 8,
        width: '80%',
    },
    loadingTextSmall: {
        height: 10,
        backgroundColor: '#F0F4FF',
        borderRadius: 4,
        width: '60%',
    },

    // Enhanced Booking Card Styles
    bookingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8F0FF',
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    bookingHeader: {
        marginBottom: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2153',
        letterSpacing: 0.3,
    },
    bookingDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2153',
        lineHeight: 20,
    },
    messageContainer: {
        backgroundColor: '#F8FAFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#6C63FF',
    },
    statusMessage: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
        lineHeight: 18,
        letterSpacing: 0.2,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6C63FF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flex: 1,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    primaryButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 6,
        letterSpacing: 0.3,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6C63FF',
        marginLeft: 6,
        letterSpacing: 0.3,
    },

    // Section with View All Button
    sectionWithButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#F0F4FF',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C63FF',
        marginRight: 4,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
        letterSpacing: 0.3,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counselorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    counselorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2153',
        marginLeft: 8,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 12,
        marginTop: 8,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minWidth: 100,
        alignItems: 'center',
    },
    optionButtonSelected: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    optionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    optionTextSelected: {
        color: '#FFFFFF',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 32,
    },
    timeButton: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    timeButtonSelected: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    timeTextSelected: {
        color: '#FFFFFF',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Add these new styles for YouTube integration
    youtubeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
};

// Merge with your existing styles
const styles = StyleSheet.create({
    // ... your existing styles ...
    ...additionalStyles,
});