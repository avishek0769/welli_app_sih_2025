import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useUser } from '../context/UserContext';
import { BASE_URL } from '../constants';

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

const Login = ({ navigation }) => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'error',
        buttonText: 'OK',
        onConfirm: null
    });
    const { currentUser, setCurrentUser } = useUser()
    
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

    const handleLogin = async () => {
        // Validation
        if (!formData.phoneNumber || !formData.password) {
            showAlert({
                title: 'Missing Information',
                message: 'Please enter both phone number and password',
                type: 'info',
                buttonText: 'Got It'
            });
            return;
        }

        if (formData.phoneNumber.length !== 10) {
            showAlert({
                title: 'Invalid Phone Number',
                message: 'Please enter a valid 10-digit phone number',
                type: 'error',
                buttonText: 'Fix Phone'
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: '+91' + formData.phoneNumber,
                    password: formData.password,
                }),
            })
            if(!res.ok) {
                throw new Error('Login failed');
            }
            const json = await res.json();
            setCurrentUser(json.data);
            AsyncStorage.setItem('accessToken', json.data.accessToken);
            AsyncStorage.setItem('refreshToken', json.data.refreshToken);
            AsyncStorage.setItem('accessTokenExp', json.data.accessTokenExp);
            AsyncStorage.setItem('refreshTokenExp', json.data.refreshTokenExp);

            const isValidCredentials = json.data && json.data._id;
            console.log('Login successful:', json.data);
            
            if (isValidCredentials) {
                showAlert({
                    title: 'Welcome Back!',
                    message: 'Login successful. Redirecting to your wellness dashboard.',
                    type: 'success',
                    buttonText: 'Continue',
                    onConfirm: () => navigation.replace('TabNavigator')
                });
            } else {
                showAlert({
                    title: 'Login Failed',
                    message: 'Invalid phone number or password. Please check your credentials and try again.',
                    type: 'error',
                    buttonText: 'Try Again'
                });
            }
        } catch (error) {
            showAlert({
                title: 'Connection Error',
                message: 'Unable to connect to the server. Please check your internet connection and try again.',
                type: 'error',
                buttonText: 'Retry'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        showAlert({
            title: 'Forgot Password',
            message: 'Password reset feature is coming soon. For now, please contact support if you need help accessing your account.',
            type: 'info',
            buttonText: 'Understood'
        });
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

    useEffect(() => {
        if (currentUser) {
            navigation.replace('TabNavigator');
        }
    }, [currentUser])

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

                    <View style={styles.loginContainer}>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Sign in to continue your wellness journey
                        </Text>

                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.phoneInputContainer}>
                                    <View style={styles.countryCode}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.phoneNumber}
                                        onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        autoFocus
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.password}
                                        onChangeText={(text) => setFormData({...formData, password: text})}
                                        secureTextEntry={!showPassword}
                                        maxLength={50}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon 
                                            name={showPassword ? 'visibility-off' : 'visibility'} 
                                            size={24} 
                                            color="#6B7280" 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.forgotPasswordButton}
                                onPress={handleForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, (!formData.phoneNumber || !formData.password || isLoading) && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={!formData.phoneNumber || !formData.password || isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.signUpButton}
                                onPress={() => navigation.navigate('SignUp')}
                                activeOpacity={0.8}
                            >
                                <Icon name="person-add" size={20} color="#6C63FF" />
                                <Text style={styles.signUpButtonText}>Create New Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Your privacy and anonymity are our top priority. 
                            All data is encrypted and secure.
                        </Text>
                    </View>

                    <View style={styles.demoCredentials}>
                        <Text style={styles.demoTitle}>Demo Credentials:</Text>
                        <Text style={styles.demoText}>Phone: 9999999999</Text>
                        <Text style={styles.demoText}>Password: 1234</Text>
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
    loginContainer: {
        flex: 1,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2153',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
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
    phoneInputContainer: {
        flexDirection: 'row',
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
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E8F0FF',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1F2153',
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#6C63FF',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 24,
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
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E8F0FF',
    },
    dividerText: {
        fontSize: 14,
        color: '#6B7280',
        marginHorizontal: 16,
        fontWeight: '500',
    },
    signUpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: '#E8F0FF',
        gap: 8,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6C63FF',
    },
    footer: {
        marginTop: 40,
        paddingTop: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 18,
    },
    demoCredentials: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 8,
    },
    demoText: {
        fontSize: 12,
        color: '#92400E',
        fontFamily: 'monospace',
        marginBottom: 2,
    },

    // Custom Alert Styles (same as SignUp)
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

export default Login;