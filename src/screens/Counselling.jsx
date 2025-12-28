import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Dimensions,
    Modal,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const Counselling = ({ navigation }) => {
    const [formData, setFormData] = useState({
        problemType: '',
        counsellingMode: '',
        urgencyLevel: '',
        timeSlot: '',
        additionalNotes: '',
        selectedDoctor: null,
    });

    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [showDoctorSelection, setShowDoctorSelection] = useState(false);
    const [isAIRecommended, setIsAIRecommended] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    const problemTypes = [
        { id: 'stress', label: 'Stress', icon: 'psychology' },
        { id: 'anxiety', label: 'Anxiety', icon: 'sentiment-very-dissatisfied' },
        { id: 'depression', label: 'Depression', icon: 'sentiment-dissatisfied' },
        { id: 'sleep', label: 'Sleep Issues', icon: 'bedtime' },
        { id: 'academic', label: 'Academic Pressure', icon: 'school' },
        { id: 'relationship', label: 'Relationship/Social Issues', icon: 'people' },
        { id: 'others', label: 'Others', icon: 'help-outline' },
    ];

    const timeSlots = [
        { id: 'morning', label: 'Morning (8:00 AM - 12:00 PM)', icon: 'wb-sunny' },
        { id: 'afternoon', label: 'Afternoon (12:00 PM - 5:00 PM)', icon: 'wb-cloudy' },
        { id: 'evening', label: 'Evening (5:00 PM - 9:00 PM)', icon: 'nights-stay' },
    ];

    // Mock doctors data - replace with your API
    const doctors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            specialization: 'Anxiety & Stress Management',
            experience: '8 years',
            rating: 4.8,
            availability: 'Available',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            consultationFee: '$75',
            nextSlot: 'Today 3:00 PM',
            matchScore: 95
        },
        {
            id: 2,
            name: 'Dr. Michael Chen',
            specialization: 'Depression & Mood Disorders',
            experience: '12 years',
            rating: 4.9,
            availability: 'Available',
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
            consultationFee: '$85',
            nextSlot: 'Tomorrow 10:00 AM',
            matchScore: 88
        },
        {
            id: 3,
            name: 'Dr. Emily Rodriguez',
            specialization: 'Academic Pressure & Student Counseling',
            experience: '6 years',
            rating: 4.7,
            availability: 'Busy',
            image: 'https://images.unsplash.com/photo-1594824388853-d0d28c0c2e07?w=150&h=150&fit=crop&crop=face',
            consultationFee: '$70',
            nextSlot: 'Friday 2:00 PM',
            matchScore: 92
        },
        {
            id: 4,
            name: 'Dr. James Wilson',
            specialization: 'Sleep Disorders & Wellness',
            experience: '10 years',
            rating: 4.6,
            availability: 'Available',
            image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
            consultationFee: '$80',
            nextSlot: 'Today 5:00 PM',
            matchScore: 85
        },
        {
            id: 5,
            name: 'Dr. Lisa Thompson',
            specialization: 'Relationship & Social Issues',
            experience: '9 years',
            rating: 4.8,
            availability: 'Available',
            image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face',
            consultationFee: '$75',
            nextSlot: 'Tomorrow 11:00 AM',
            matchScore: 90
        }
    ];

    // AI Logic to select best doctor based on form data
    const getAIRecommendedDoctor = () => {
        let bestDoctor = doctors[0];
        let highestScore = 0;

        doctors.forEach(doctor => {
            let score = doctor.matchScore;

            // Boost score based on problem type match
            if (formData.problemType === 'anxiety' && doctor.specialization.includes('Anxiety')) {
                score += 15;
            }
            if (formData.problemType === 'depression' && doctor.specialization.includes('Depression')) {
                score += 15;
            }
            if (formData.problemType === 'academic' && doctor.specialization.includes('Academic')) {
                score += 15;
            }
            if (formData.problemType === 'sleep' && doctor.specialization.includes('Sleep')) {
                score += 15;
            }
            if (formData.problemType === 'relationship' && doctor.specialization.includes('Relationship')) {
                score += 15;
            }

            // Boost score for availability
            if (doctor.availability === 'Available') {
                score += 10;
            }

            // Boost score for urgency match
            if (formData.urgencyLevel === 'urgent' && doctor.nextSlot.includes('Today')) {
                score += 20;
            }

            if (score > highestScore) {
                highestScore = score;
                bestDoctor = doctor;
            }
        });

        return bestDoctor;
    };

    const handleAIAssign = async () => {
        // Validate required fields
        if (!formData.problemType || !formData.counsellingMode || !formData.urgencyLevel || !formData.timeSlot) {
            setShowValidationModal(true);
            return;
        }

        // Show loading state
        setIsAILoading(true);

        // Simulate AI processing delay
        setTimeout(() => {
            // AI assigns best doctor automatically
            const aiRecommendedDoctor = getAIRecommendedDoctor();
            setFormData({ ...formData, selectedDoctor: aiRecommendedDoctor });
            setIsAIRecommended(true);
            setShowDoctorSelection(true);
            setIsAILoading(false);
        }, 2000); // 2 second loading
    };

    const handleManualSelection = () => {
        // Validate required fields
        if (!formData.problemType || !formData.counsellingMode || !formData.urgencyLevel || !formData.timeSlot) {
            setShowValidationModal(true);
            return;
        }

        // Show doctor selection modal
        setShowDoctorModal(true);
    };

    const handleDoctorSelection = (doctor) => {
        setFormData({ ...formData, selectedDoctor: doctor });
        setShowDoctorModal(false);
        setIsAIRecommended(false); // Manual selection, not AI recommended
        setShowDoctorSelection(true);
    };

    const handleSubmitBooking = () => {
        setShowSuccessModal(true);
    };

    const handleChangeDoctor = () => {
        setShowDoctorModal(true);
    };

    const resetForm = () => {
        setFormData({
            problemType: '',
            counsellingMode: '',
            urgencyLevel: '',
            timeSlot: '',
            additionalNotes: '',
            selectedDoctor: null,
        });
        setShowSuccessModal(false);
        setShowDoctorSelection(false);
        setIsAIRecommended(false);
        setIsAILoading(false);
    };

    const handleProblemTypeSelect = (typeId) => {
        setFormData({ ...formData, problemType: typeId });
    };

    const handleRadioSelect = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const renderProblemTypeChips = () => {
        return (
            <View style={styles.chipsContainer}>
                {problemTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.chip,
                            formData.problemType === type.id && styles.chipSelected
                        ]}
                        onPress={() => handleProblemTypeSelect(type.id)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon
                            name={type.icon}
                            size={20}
                            color={formData.problemType === type.id ? '#6C63FF' : '#6B7280'}
                        />
                        <Text style={[
                            styles.chipText,
                            formData.problemType === type.id && styles.chipTextSelected
                        ]}>
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderRadioGroup = (options, selectedValue, field) => {
        return (
            <View style={styles.radioContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.radioOption,
                            selectedValue === option.value && styles.radioOptionSelected
                        ]}
                        onPress={() => handleRadioSelect(field, option.value)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                        <View style={[
                            styles.radioCircle,
                            selectedValue === option.value && styles.radioCircleSelected
                        ]}>
                            {selectedValue === option.value && (
                                <View style={styles.radioSelected} />
                            )}
                        </View>
                        <Text style={[
                            styles.radioText,
                            selectedValue === option.value && styles.radioTextSelected
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderSelectedDoctor = () => {
        if (!showDoctorSelection || !formData.selectedDoctor) return null;

        return (
            <View style={styles.selectedDoctorSection}>
                <Text style={styles.sectionTitle}>Selected Counsellor</Text>

                <View style={styles.selectedDoctorCard}>
                    {/* Only show AI recommended badge if it was AI selected */}
                    {isAIRecommended && (
                        <View style={styles.aiRecommendationBadge}>
                            <Icon name="psychology" size={16} color="#10B981" />
                            <Text style={styles.aiRecommendationText}>AI Recommended</Text>
                        </View>
                    )}

                    <View style={styles.selectedDoctorHeader}>
                        <View style={styles.selectedDoctorImageContainer}>
                            <Image
                                source={{ uri: formData.selectedDoctor.image }}
                                style={styles.selectedDoctorImage}
                            />
                            <View style={[
                                styles.selectedAvailabilityBadge,
                                { backgroundColor: formData.selectedDoctor.availability === 'Available' ? '#10B981' : '#F59E0B' }
                            ]}>
                                <Text style={styles.selectedAvailabilityText}>
                                    {formData.selectedDoctor.availability}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.selectedDoctorInfo}>
                            <Text style={styles.selectedDoctorName}>
                                {formData.selectedDoctor.name}
                            </Text>
                            <Text style={styles.selectedDoctorSpecialization}>
                                {formData.selectedDoctor.specialization}
                            </Text>

                            <View style={styles.selectedDoctorMeta}>
                                <View style={styles.selectedMetaItem}>
                                    <Icon name="work" size={14} color="#6B7280" />
                                    <Text style={styles.selectedMetaText}>
                                        {formData.selectedDoctor.experience}
                                    </Text>
                                </View>
                                <View style={styles.selectedMetaItem}>
                                    <Icon name="star" size={14} color="#FCD34D" />
                                    <Text style={styles.selectedMetaText}>
                                        {formData.selectedDoctor.rating}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.changeDoctorButton}
                            onPress={handleChangeDoctor}
                            activeOpacity={0.7}
                        >
                            <Icon name="swap-horiz" size={20} color="#6C63FF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectedDoctorFooter}>
                        <View style={styles.selectedFeeContainer}>
                            <Text style={styles.selectedFeeLabel}>Consultation Fee:</Text>
                            <Text style={styles.selectedFeeAmount}>
                                {formData.selectedDoctor.consultationFee}
                            </Text>
                        </View>
                        <Text style={styles.selectedNextSlot}>
                            Next Available: {formData.selectedDoctor.nextSlot}
                        </Text>
                    </View>
                </View>

                {/* Keep buttons visible even after selection */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleAIAssign}
                        activeOpacity={0.8}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        disabled={isAILoading}
                    >
                        <View style={styles.buttonIconContainer}>
                            {isAILoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Icon name="psychology" size={24} color="#FFFFFF" />
                            )}
                        </View>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.primaryButtonText}>
                                {isAILoading ? 'Finding Best Match...' : 'AI Assign Counsellor'}
                            </Text>
                            <Text style={styles.primaryButtonSubtext}>
                                {isAILoading ? 'Analyzing your needs' : 'Let AI find the best match'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleManualSelection}
                        activeOpacity={0.8}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="people" size={20} color="#6C63FF" />
                        <Text style={styles.secondaryButtonText}>Choose Doctor Manually</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmitBooking}
                        activeOpacity={0.8}
                    >
                        <Icon name="check-circle" size={24} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Submit Booking Request</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDoctorCard = ({ item }) => (
        <TouchableOpacity
            style={styles.doctorCard}
            onPress={() => handleDoctorSelection(item)}
            activeOpacity={0.8}
        >
            <View style={styles.doctorImageContainer}>
                <Image source={{ uri: item.image }} style={styles.doctorImage} />
                <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: item.availability === 'Available' ? '#10B981' : '#F59E0B' }
                ]}>
                    <Text style={styles.availabilityText}>{item.availability}</Text>
                </View>
            </View>

            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorSpecialization}>{item.specialization}</Text>

                <View style={styles.doctorMeta}>
                    <View style={styles.metaItem}>
                        <Icon name="work" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{item.experience}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="star" size={14} color="#FCD34D" />
                        <Text style={styles.metaText}>{item.rating}</Text>
                    </View>
                </View>

                <View style={styles.doctorFooter}>
                    <View style={styles.feeContainer}>
                        <Text style={styles.feeLabel}>Fee:</Text>
                        <Text style={styles.feeAmount}>{item.consultationFee}</Text>
                    </View>
                    <Text style={styles.nextSlot}>{item.nextSlot}</Text>
                </View>
            </View>

            <View style={styles.selectButton}>
                <Icon name="chevron-right" size={24} color="#6C63FF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* <Header title="Book Counselling" showBack={false} /> */}

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.subtitle}>
                    Let's find the right support for you. Fill out this form to get started.
                </Text>

                {/* Problem Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        What brings you here today? *
                    </Text>
                    <Text style={styles.sectionDescription}>
                        Select the main area you'd like support with
                    </Text>
                    {renderProblemTypeChips()}
                </View>

                {/* Counselling Mode */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        How would you prefer to meet? *
                    </Text>
                    {renderRadioGroup(
                        [
                            { label: 'In-person session', value: 'in-person' },
                            { label: 'Online video call', value: 'online' },
                        ],
                        formData.counsellingMode,
                        'counsellingMode'
                    )}
                </View>

                {/* Urgency Level */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        How soon would you like to meet? *
                    </Text>
                    {renderRadioGroup(
                        [
                            { label: 'Within the next week', value: 'normal' },
                            { label: 'Within 2-3 days', value: 'soon' },
                            { label: 'As soon as possible', value: 'urgent' },
                        ],
                        formData.urgencyLevel,
                        'urgencyLevel'
                    )}
                </View>

                {/* Time Slot */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        What time works best for you? *
                    </Text>
                    <TouchableOpacity
                        style={[styles.dropdown, showTimeDropdown && styles.dropdownActive]}
                        onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[
                            styles.dropdownText,
                            !formData.timeSlot && styles.dropdownPlaceholder
                        ]}>
                            {formData.timeSlot
                                ? timeSlots.find(slot => slot.id === formData.timeSlot)?.label
                                : 'Select preferred time'
                            }
                        </Text>
                        <Icon
                            name={showTimeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={24}
                            color="#6B7280"
                        />
                    </TouchableOpacity>

                    {showTimeDropdown && (
                        <View style={styles.dropdownMenu}>
                            {timeSlots.map((slot) => (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.dropdownItem,
                                        formData.timeSlot === slot.id && styles.dropdownItemSelected
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, timeSlot: slot.id });
                                        setShowTimeDropdown(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Icon name={slot.icon} size={20} color="#6C63FF" />
                                    <Text style={[
                                        styles.dropdownItemText,
                                        formData.timeSlot === slot.id && styles.dropdownItemTextSelected
                                    ]}>
                                        {slot.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Additional Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Anything else you'd like to share? (Optional)
                    </Text>
                    <Text style={styles.sectionDescription}>
                        This helps us better understand your needs
                    </Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                        placeholder="Feel free to share any additional context, specific concerns, or preferences..."
                        placeholderTextColor="#9CA3AF"
                        value={formData.additionalNotes}
                        onChangeText={(text) => setFormData({ ...formData, additionalNotes: text })}
                        textAlignVertical="top"
                    />
                </View>

                {/* AI Loading State */}
                {isAILoading && (
                    <View style={styles.aiLoadingContainer}>
                        <View style={styles.aiLoadingCard}>
                            <ActivityIndicator size="large" color="#6C63FF" />
                            <Text style={styles.aiLoadingTitle}>Finding Your Perfect Match</Text>
                            <Text style={styles.aiLoadingDescription}>
                                Our AI is analyzing your needs and matching you with the best counsellor...
                            </Text>
                            <View style={styles.loadingSteps}>
                                <Text style={styles.loadingStep}>• Analyzing your problem type</Text>
                                <Text style={styles.loadingStep}>• Checking counsellor availability</Text>
                                <Text style={styles.loadingStep}>• Matching specializations</Text>
                                <Text style={styles.loadingStep}>• Optimizing for your schedule</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Selected Doctor Section */}
                {renderSelectedDoctor()}

                {/* Action Buttons - Only show if doctor not selected */}
                {!showDoctorSelection && !isAILoading && (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleAIAssign}
                            activeOpacity={0.8}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <View style={styles.buttonIconContainer}>
                                <Icon name="psychology" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.buttonTextContainer}>
                                <Text style={styles.primaryButtonText}>AI Assign Counsellor</Text>
                                <Text style={styles.primaryButtonSubtext}>Let AI find the best match</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleManualSelection}
                            activeOpacity={0.8}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="people" size={20} color="#6C63FF" />
                            <Text style={styles.secondaryButtonText}>Choose Doctor Manually</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Validation Modal */}
            <Modal
                visible={showValidationModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowValidationModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.errorIcon}>
                                <Icon name="error-outline" size={32} color="#EF4444" />
                            </View>
                            <Text style={styles.modalTitle}>Missing Information</Text>
                            <Text style={styles.modalSubtitle}>
                                Please fill in all required fields before proceeding.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowValidationModal(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>OK, I'll complete it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Doctor Selection Modal */}
            <Modal
                visible={showDoctorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDoctorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.doctorModalContainer}>
                        <View style={styles.doctorModalHeader}>
                            <Text style={styles.doctorModalTitle}>Choose Your Counsellor</Text>
                            <TouchableOpacity
                                onPress={() => setShowDoctorModal(false)}
                                style={styles.closeButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.doctorModalSubtitle}>
                            Select a counsellor that matches your needs
                        </Text>

                        <FlatList
                            data={doctors}
                            renderItem={renderDoctorCard}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.doctorsList}
                        />
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.successIcon}>
                                <Icon name="check-circle" size={32} color="#10B981" />
                            </View>
                            <Text style={styles.modalTitle}>Booking Submitted!</Text>
                            <Text style={styles.modalSubtitle}>
                                Your session with {formData.selectedDoctor?.name} has been requested.
                                You'll receive a confirmation shortly with session details.
                            </Text>
                        </View>

                        <View style={styles.finalSelectedDoctorInfo}>
                            <Image
                                source={{ uri: formData.selectedDoctor?.image }}
                                style={styles.finalSelectedDoctorImage}
                            />
                            <View style={styles.finalSelectedDoctorDetails}>
                                <Text style={styles.finalSelectedDoctorName}>
                                    {formData.selectedDoctor?.name}
                                </Text>
                                <Text style={styles.finalSelectedDoctorSpec}>
                                    {formData.selectedDoctor?.specialization}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={resetForm}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalButtonText}>Great, Thank You!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginVertical: 20,
        marginTop: 45,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        backgroundColor: '#FFFFFF',
        gap: 8,
        minWidth: width * 0.28,
    },
    chipSelected: {
        borderColor: '#6C63FF',
        backgroundColor: '#F0F4FF',
    },
    chipText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    radioContainer: {
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        backgroundColor: '#FFFFFF',
        gap: 12,
    },
    radioOptionSelected: {
        borderColor: '#6C63FF',
        backgroundColor: '#F0F4FF',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#6C63FF',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6C63FF',
    },
    radioText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    radioTextSelected: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        backgroundColor: '#FFFFFF',
    },
    dropdownActive: {
        borderColor: '#6C63FF',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    dropdownPlaceholder: {
        color: '#9CA3AF',
    },
    dropdownMenu: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8F0FF',
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemSelected: {
        backgroundColor: '#F0F4FF',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    dropdownItemTextSelected: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    textArea: {
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#374151',
        backgroundColor: '#FFFFFF',
        minHeight: 100,
    },
    aiLoadingContainer: {
        marginBottom: 32,
    },
    aiLoadingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6C63FF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    aiLoadingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
        marginTop: 16,
        marginBottom: 8,
    },
    aiLoadingDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    loadingSteps: {
        alignSelf: 'stretch',
    },
    loadingStep: {
        fontSize: 12,
        color: '#6C63FF',
        marginBottom: 4,
        paddingLeft: 8,
    },

    // Selected Doctor Section Styles
    selectedDoctorSection: {
        marginBottom: 32,
    },
    selectedDoctorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#10B981',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    aiRecommendationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
        gap: 6,
    },
    aiRecommendationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    selectedDoctorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectedDoctorImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    selectedDoctorImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    selectedAvailabilityBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    selectedAvailabilityText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    selectedDoctorInfo: {
        flex: 1,
    },
    selectedDoctorName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 4,
    },
    selectedDoctorSpecialization: {
        fontSize: 16,
        color: '#10B981',
        fontWeight: '500',
        marginBottom: 8,
    },
    selectedDoctorMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    selectedMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    selectedMetaText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    changeDoctorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    selectedDoctorFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F4FF',
    },
    selectedFeeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedFeeLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    selectedFeeAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2153',
    },
    selectedNextSlot: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
        textAlign: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
        marginBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    buttonsContainer: {
        gap: 12,
        marginTop: 20,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        borderRadius: 16,
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
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    primaryButtonSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#6C63FF',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6C63FF',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    errorIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    finalSelectedDoctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    finalSelectedDoctorImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    finalSelectedDoctorDetails: {
        flex: 1,
    },
    finalSelectedDoctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 2,
    },
    finalSelectedDoctorSpec: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Doctor Modal Styles
    doctorModalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.85,
        width: '100%',
        marginTop: height * 0.15,
    },
    doctorModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
    },
    doctorModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorModalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    doctorsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    doctorImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    doctorImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    availabilityBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    availabilityText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 4,
    },
    doctorSpecialization: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    doctorMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    doctorFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    feeLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    feeAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2153',
    },
    nextSlot: {
        fontSize: 12,
        color: '#6C63FF',
        fontWeight: '500',
    },
    selectButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F4FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
});

export default Counselling;