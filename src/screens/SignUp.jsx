import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Reusable Custom Alert Component
const CustomAlert = ({ visible, onClose, title, message, type = 'error', buttonText = 'OK', onConfirm }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertHeader}>
                        <View style={[
                            styles.alertIcon,
                            type === 'success' && styles.alertIconSuccess,
                            type === 'error' && styles.alertIconError,
                            type === 'info' && styles.alertIconInfo,
                        ]}>
                            <Icon 
                                name={
                                    type === 'success' ? 'check-circle' :
                                    type === 'error' ? 'error-outline' :
                                    'info-outline'
                                } 
                                size={32} 
                                color="#FFFFFF" 
                            />
                        </View>
                        <Text style={styles.alertTitle}>{title}</Text>
                        <Text style={styles.alertMessage}>{message}</Text>
                    </View>
                    
                    <TouchableOpacity
                        style={[
                            styles.alertButton,
                            type === 'success' && styles.alertButtonSuccess,
                            type === 'error' && styles.alertButtonError,
                            type === 'info' && styles.alertButtonInfo,
                        ]}
                        onPress={onConfirm || onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.alertButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const SignUp = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [profileData, setProfileData] = useState({
        anonymousName: '',
        age: '',
        gender: '',
        institution: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [otpTimer, setOtpTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'error',
        buttonText: 'OK',
        onConfirm: null
    });

    const otpInputs = useRef([]);

    // Anonymous name suggestions
    const anonymousNames = [
        'WellnessSeeker', 'MindfulStudent', 'HopeBuilder', 'CalmWanderer', 'PeacefulSoul',
        'BraveHeart', 'QuietMind', 'StrongSpirit', 'GentleWarrior', 'SereneStudent',
        'ThoughtfulOne', 'WiseSeeker', 'KindSoul', 'BoldDreamer', 'TranquilMind',
        'CourageousHeart', 'HealingJourney', 'ZenStudent', 'InnerPeace', 'BrightSpirit',
        'CalmThinker', 'HappyVibes', 'PositiveMind', 'SunnyDay', 'FreeSpirit',
        'OpenHeart', 'SafeSpace', 'TrueWanderer', 'BlissfulSoul', 'PureMind',
        'StudentHelper', 'MindMender', 'SoulSearcher', 'DreamChaser', 'LifeLearner',
        'WellnessWarrior', 'HealingHeart', 'PeaceMaker', 'JoySeeker', 'LightBearer',
        'CompassionateOne', 'EmpathicSoul', 'GratefulHeart', 'ReslientMind', 'HopefulOne'
    ];

    // Show custom alert
    const showAlert = (config) => {
        setAlertConfig(config);
        setAlertVisible(true);
    };

    const hideAlert = () => {
        setAlertVisible(false);
        if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
        }
    };

    // Generate random anonymous name
    const generateAnonymousName = () => {
        const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
        const randomNumber = Math.floor(Math.random() * 999) + 1;
        const generatedName = `${randomName}${randomNumber}`;
        setProfileData({ ...profileData, anonymousName: generatedName });
    };

    // OTP Timer Effect
    useEffect(() => {
        let interval = null;
        if (currentStep === 2 && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(timer => {
                    if (timer === 1) {
                        setCanResend(true);
                    }
                    return timer - 1;
                });
            }, 1000);
        } else if (otpTimer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [currentStep, otpTimer]);

    const handlePhoneSubmit = async () => {
        if (phoneNumber.length !== 10) {
            showAlert({
                title: 'Invalid Phone Number',
                message: 'Please enter a valid 10-digit phone number',
                type: 'error',
                buttonText: 'Try Again'
            });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setCurrentStep(2);
            setOtpTimer(60);
            setCanResend(false);
            
            console.log('OTP sent to:', phoneNumber);
        } catch (error) {
            showAlert({
                title: 'Error',
                message: 'Failed to send OTP. Please try again.',
                type: 'error',
                buttonText: 'Retry'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (index, key) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleOtpVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            showAlert({
                title: 'Invalid OTP',
                message: 'Please enter the complete 6-digit verification code',
                type: 'error',
                buttonText: 'Got It'
            });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setCurrentStep(3);
            
            console.log('OTP verified:', otpCode);
        } catch (error) {
            showAlert({
                title: 'Verification Failed',
                message: 'Invalid OTP. Please check and try again.',
                type: 'error',
                buttonText: 'Retry'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOtpTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            
            showAlert({
                title: 'OTP Sent',
                message: 'A new verification code has been sent to your phone number',
                type: 'success',
                buttonText: 'Great!'
            });
        } catch (error) {
            showAlert({
                title: 'Error',
                message: 'Failed to resend OTP. Please try again.',
                type: 'error',
                buttonText: 'Retry'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSubmit = async () => {
        if (!profileData.anonymousName || !profileData.age || !profileData.gender) {
            showAlert({
                title: 'Missing Information',
                message: 'Please fill in all required fields before proceeding',
                type: 'info',
                buttonText: 'Complete Form'
            });
            return;
        }

        if (parseInt(profileData.age) < 13 || parseInt(profileData.age) > 100) {
            showAlert({
                title: 'Invalid Age',
                message: 'Please enter a valid age between 13 and 100',
                type: 'error',
                buttonText: 'Fix Age'
            });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const userData = {
                phone: phoneNumber,
                ...profileData,
                isAnonymous: true,
                createdAt: new Date().toISOString(),
            };
            
            console.log('Account created:', userData);
            
            showAlert({
                title: 'Welcome to Welli!',
                message: 'Your anonymous account has been created successfully. Ready to start your wellness journey?',
                type: 'success',
                buttonText: 'Get Started',
                onConfirm: () => navigation.replace('TabNavigator')
            });
            
        } catch (error) {
            showAlert({
                title: 'Account Creation Failed',
                message: 'Something went wrong. Please try again.',
                type: 'error',
                buttonText: 'Retry'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderAppLogo = () => (
        <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
                <Icon name="favorite" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Welli</Text>
            <Text style={styles.appTagline}>Your Wellness Companion</Text>
        </View>
    );

    const renderProgressIndicator = () => (
        <View style={styles.progressContainer}>
            {[1, 2, 3].map((step) => (
                <View key={step} style={styles.progressStep}>
                    <View style={[
                        styles.progressCircle,
                        currentStep >= step && styles.progressCircleActive
                    ]}>
                        {currentStep > step ? (
                            <Icon name="check" size={16} color="#FFFFFF" />
                        ) : (
                            <Text style={[
                                styles.progressNumber,
                                currentStep >= step && styles.progressNumberActive
                            ]}>
                                {step}
                            </Text>
                        )}
                    </View>
                    {step < 3 && (
                        <View style={[
                            styles.progressLine,
                            currentStep > step && styles.progressLineActive
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );

    const renderPhoneStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Enter Your Phone Number</Text>
            <Text style={styles.stepDescription}>
                We'll send you a verification code to get started. Your phone number will remain private.
            </Text>

            <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus
                />
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, (!phoneNumber || isLoading) && styles.buttonDisabled]}
                onPress={handlePhoneSubmit}
                disabled={!phoneNumber || isLoading}
                activeOpacity={0.8}
            >
                <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderOtpStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Enter Verification Code</Text>
            <Text style={styles.stepDescription}>
                We've sent a 6-digit code to +91 {phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={ref => otpInputs.current[index] = ref}
                        style={[
                            styles.otpInput,
                            digit && styles.otpInputFilled
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, (otp.join('').length !== 6 || isLoading) && styles.buttonDisabled]}
                onPress={handleOtpVerify}
                disabled={otp.join('').length !== 6 || isLoading}
                activeOpacity={0.8}
            >
                <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                {otpTimer > 0 ? (
                    <Text style={styles.timerText}>
                        Resend code in {otpTimer}s
                    </Text>
                ) : (
                    <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                        <Text style={styles.resendText}>
                            {isLoading ? 'Sending...' : 'Resend Code'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(1)}
            >
                <Icon name="arrow-back" size={20} color="#6C63FF" />
                <Text style={styles.backButtonText}>Change Phone Number</Text>
            </TouchableOpacity>
        </View>
    );

    const renderProfileStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create Your Anonymous Profile</Text>
            <Text style={styles.stepDescription}>
                This information helps us provide better support while keeping you anonymous.
            </Text>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Anonymous Name *</Text>
                    <View style={styles.nameInputContainer}>
                        <TextInput
                            style={styles.nameInput}
                            placeholder="Choose a name (e.g., Student123, Helper, etc.)"
                            placeholderTextColor="#9CA3AF"
                            value={profileData.anonymousName}
                            onChangeText={(text) => setProfileData({...profileData, anonymousName: text})}
                            maxLength={20}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.generateNameButton}
                        onPress={generateAnonymousName}
                        activeOpacity={0.7}
                    >
                        <Icon name="auto-awesome" size={16} color="#6C63FF" />
                        <Text style={styles.generateNameText}>Generate Random Name</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Age *</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your age"
                        placeholderTextColor="#9CA3AF"
                        value={profileData.age}
                        onChangeText={(text) => setProfileData({...profileData, age: text})}
                        keyboardType="number-pad"
                        maxLength={3}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Gender *</Text>
                    <View style={styles.genderContainer}>
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map((gender) => (
                            <TouchableOpacity
                                key={gender}
                                style={[
                                    styles.genderOption,
                                    profileData.gender === gender && styles.genderOptionSelected
                                ]}
                                onPress={() => setProfileData({...profileData, gender})}
                            >
                                <Text style={[
                                    styles.genderOptionText,
                                    profileData.gender === gender && styles.genderOptionTextSelected
                                ]}>
                                    {gender}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Institution (Optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="School/College name"
                        placeholderTextColor="#9CA3AF"
                        value={profileData.institution}
                        onChangeText={(text) => setProfileData({...profileData, institution: text})}
                        maxLength={50}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, (!profileData.anonymousName || !profileData.age || !profileData.gender || isLoading) && styles.buttonDisabled]}
                onPress={handleProfileSubmit}
                disabled={!profileData.anonymousName || !profileData.age || !profileData.gender || isLoading}
                activeOpacity={0.8}
            >
                <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Creating Account...' : 'Create Anonymous Account'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(2)}
            >
                <Icon name="arrow-back" size={20} color="#6C63FF" />
                <Text style={styles.backButtonText}>Back to Verification</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderAppLogo()}

                    {renderProgressIndicator()}

                    {currentStep === 1 && renderPhoneStep()}
                    {currentStep === 2 && renderOtpStep()}
                    {currentStep === 3 && renderProfileStep()}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our privacy-first approach. 
                            Your identity remains completely anonymous.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Alert Component */}
            <CustomAlert
                visible={alertVisible}
                onClose={hideAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttonText={alertConfig.buttonText}
                onConfirm={alertConfig.onConfirm}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    logoIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#6C63FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1F2153',
        marginBottom: 4,
        letterSpacing: -1,
    },
    appTagline: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    progressStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F0FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E8F0FF',
    },
    progressCircleActive: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    progressNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    progressNumberActive: {
        color: '#FFFFFF',
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: '#E8F0FF',
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: '#6C63FF',
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2153',
        textAlign: 'center',
        marginBottom: 12,
    },
    stepDescription: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 32,
    },
    countryCode: {
        backgroundColor: '#E8F0FF',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRightWidth: 0,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderLeftWidth: 0,
        color: '#1F2153',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 300,
        marginBottom: 32,
        gap: 12,
    },
    otpInput: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2153',
        backgroundColor: '#FFFFFF',
    },
    otpInputFilled: {
        borderColor: '#6C63FF',
        backgroundColor: '#F0F4FF',
    },
    formContainer: {
        width: '100%',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 8,
    },
    nameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    nameInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2153',
    },
    generateNameButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#6C63FF',
        gap: 6,
    },
    generateNameText: {
        fontSize: 12,
        color: '#6C63FF',
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2153',
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    genderOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        backgroundColor: '#FFFFFF',
    },
    genderOptionSelected: {
        borderColor: '#6C63FF',
        backgroundColor: '#F0F4FF',
    },
    genderOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    genderOptionTextSelected: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resendContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    timerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    resendText: {
        fontSize: 14,
        color: '#6C63FF',
        fontWeight: '600',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    backButtonText: {
        fontSize: 14,
        color: '#6C63FF',
        fontWeight: '500',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    },

    // Custom Alert Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
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
    alertHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    alertIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    alertIconSuccess: {
        backgroundColor: '#10B981',
    },
    alertIconError: {
        backgroundColor: '#EF4444',
    },
    alertIconInfo: {
        backgroundColor: '#3B82F6',
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2153',
        marginBottom: 8,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    alertButton: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    alertButtonSuccess: {
        backgroundColor: '#10B981',
    },
    alertButtonError: {
        backgroundColor: '#EF4444',
    },
    alertButtonInfo: {
        backgroundColor: '#3B82F6',
    },
    alertButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default SignUp;