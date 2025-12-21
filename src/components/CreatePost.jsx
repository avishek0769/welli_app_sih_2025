import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid,
    Modal,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useUser } from '../context/UserContext';

// Custom Popup Component
const CustomPopup = ({ visible, title, message, buttons, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.popupOverlay, { opacity: fadeAnim }]}>
                <Animated.View style={[
                    styles.popupContainer,
                    {
                        transform: [{
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            })
                        }]
                    }
                ]}>
                    <View style={styles.popupHeader}>
                        <Text style={styles.popupTitle}>{title}</Text>
                    </View>
                    
                    {message && (
                        <View style={styles.popupBody}>
                            <Text style={styles.popupMessage}>{message}</Text>
                        </View>
                    )}
                    
                    <View style={styles.popupButtons}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.popupButton,
                                    button.style === 'cancel' && styles.popupButtonCancel,
                                    button.style === 'destructive' && styles.popupButtonDestructive,
                                    index === buttons.length - 1 && styles.popupButtonLast
                                ]}
                                onPress={() => {
                                    button.onPress && button.onPress();
                                    onClose();
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.popupButtonText,
                                    button.style === 'cancel' && styles.popupButtonTextCancel,
                                    button.style === 'destructive' && styles.popupButtonTextDestructive,
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

// Custom Toast Component
const CustomToast = ({ visible, message, type = 'error', onHide }) => {
    const [slideAnim] = useState(new Animated.Value(-100));

    React.useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2500),
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                onHide();
            });
        }
    }, [visible, slideAnim, onHide]);

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.toastContainer,
            type === 'error' && styles.toastError,
            type === 'success' && styles.toastSuccess,
            { transform: [{ translateY: slideAnim }] }
        ]}>
            <Icon 
                name={type === 'error' ? 'error' : 'check-circle'} 
                size={20} 
                color="#FFFFFF" 
            />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const CreatePost = ({ onCreatePost, onCancel }) => {
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const { currentUser } = useUser();
    
    // Popup states
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showPermissionDenied, setShowPermissionDenied] = useState(false);
    const [showFileTooLarge, setShowFileTooLarge] = useState(false);
    const [showEmptyContent, setShowEmptyContent] = useState(false);
    
    // Toast states
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('error');

    const showToastMessage = (message, type = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Request camera permission for Android
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleImagePicker = () => {
        setShowImagePicker(true);
    };

    const handleImageResponse = (response) => {
        if (response.didCancel || response.error) {
            console.log('Image picker cancelled or error:', response.error);
            return;
        }

        if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            
            // Check file size (limit to 5MB)
            if (asset.fileSize > 5 * 1024 * 1024) {
                setShowFileTooLarge(true);
                return;
            }

            setSelectedImage({
                uri: asset.uri,
                fileName: asset.fileName || 'image.jpg',
                type: asset.type || 'image/jpeg',
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
            });

            showToastMessage('Image selected successfully!', 'success');
        }
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
            const options = {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
                quality: 0.8,
            };
            launchCamera(options, handleImageResponse);
        } else {
            setShowPermissionDenied(true);
        }
    };

    const openGallery = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };
        launchImageLibrary(options, handleImageResponse);
    };

    const removeImage = () => {
        setSelectedImage(null);
        showToastMessage('Image removed', 'success');
    };

    const handlePost = async () => {
        if (!content.trim()) {
            setShowEmptyContent(true);
            return;
        }

        setIsPosting(true);
        
        // Simulate posting delay
        setTimeout(() => {
            onCreatePost({
                content: content.trim(),
                category: selectedCategory,
                imageData: selectedImage,
            });
            
            // Reset form
            setContent('');
            setSelectedCategory('General');
            setSelectedImage(null);
            setIsPosting(false);
            
            showToastMessage('Post created successfully!', 'success');
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={onCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>New Post</Text>
                    
                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            (!content.trim() || isPosting) && styles.postButtonDisabled
                        ]}
                        onPress={handlePost}
                        disabled={!content.trim() || isPosting}
                    >
                        <Text style={[
                            styles.postButtonText,
                            (!content.trim() || isPosting) && styles.postButtonTextDisabled
                        ]}>
                            {isPosting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* User Info */}
                    <View style={styles.userSection}>
                        <View style={[styles.avatar, !currentUser?.avatar && { backgroundColor: '#6C63FF', borderRadius: 20 }]}>
                            {currentUser.avatar ? <Image source={{ uri: currentUser.avatar }}
                                style={styles.avatar}
                                resizeMode="cover"
                            /> : (
                                <Text style={styles.avatarText}>
                                    {currentUser.annonymousUsername.charAt(0).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.username}>Posting as {currentUser?.annonymousUsername}</Text>
                    </View>

                    {/* Text Input */}
                    <View style={styles.inputSection}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="What's on your mind? Share your thoughts, experiences, or questions with the community..."
                            placeholderTextColor="#9CA3AF"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                            autoFocus
                        />
                        <Text style={styles.characterCount}>
                            {content.length}/500
                        </Text>
                    </View>

                    {/* Selected Image Preview */}
                    {selectedImage && (
                        <View style={styles.imagePreview}>
                            <Image 
                                source={{ uri: selectedImage.uri }} 
                                style={styles.previewImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={removeImage}
                            >
                                <Icon name="close" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            
                            {/* Image Info */}
                            <View style={styles.imageInfo}>
                                <Text style={styles.imageInfoText}>
                                    {selectedImage.fileName} • {(selectedImage.fileSize / (1024 * 1024)).toFixed(1)}MB
                                </Text>
                                <Text style={styles.imageInfoText}>
                                    {selectedImage.width} × {selectedImage.height}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleImagePicker}
                            activeOpacity={0.7}
                        >
                            <Icon 
                                name={selectedImage ? "edit" : "image"} 
                                size={20} 
                                color="#6C63FF" 
                            />
                            <Text style={styles.actionButtonText}>
                                {selectedImage ? 'Change Image' : 'Add Image'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Guidelines */}
                    <View style={styles.guidelines}>
                        <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
                        <Text style={styles.guidelinesText}>
                            • Be respectful and supportive of others{'\n'}
                            • Share constructive thoughts and experiences{'\n'}
                            • Keep content relevant to mental wellness{'\n'}
                            • No personal information or contact details{'\n'}
                            • Images should be appropriate and under 5MB
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Custom Popups */}
            <CustomPopup
                visible={showImagePicker}
                title="Select Image"
                message="Choose an option to add an image"
                buttons={[
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Camera', onPress: openCamera },
                    { text: 'Gallery', onPress: openGallery },
                    ...(selectedImage ? [{ text: 'Remove Image', onPress: removeImage, style: 'destructive' }] : [])
                ]}
                onClose={() => setShowImagePicker(false)}
            />

            <CustomPopup
                visible={showPermissionDenied}
                title="Permission Denied"
                message="Camera permission is required to take photos."
                buttons={[
                    { text: 'OK', style: 'cancel' }
                ]}
                onClose={() => setShowPermissionDenied(false)}
            />

            <CustomPopup
                visible={showFileTooLarge}
                title="File Too Large"
                message="Please select an image smaller than 5MB."
                buttons={[
                    { text: 'OK', style: 'cancel' }
                ]}
                onClose={() => setShowFileTooLarge(false)}
            />

            <CustomPopup
                visible={showEmptyContent}
                title="Empty Post"
                message="Please write something to share with the community."
                buttons={[
                    { text: 'OK', style: 'cancel' }
                ]}
                onClose={() => setShowEmptyContent(false)}
            />

            {/* Custom Toast */}
            <CustomToast
                visible={showToast}
                message={toastMessage}
                type={toastType}
                onHide={() => setShowToast(false)}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4FF',
    },
    cancelButton: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
    },
    postButton: {
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    postButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    postButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    postButtonTextDisabled: {
        color: '#9CA3AF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
    },
    inputSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    textInput: {
        fontSize: 16,
        color: '#1F2153',
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    characterCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 8,
    },
    imagePreview: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8F0FF',
    },
    previewImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F8FAFF',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageInfo: {
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    imageInfoText: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
    },
    categorySection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2153',
        marginBottom: 12,
    },
    categoriesScroll: {
        flexGrow: 0,
    },
    categoriesContent: {
        paddingRight: 16,
    },
    categoryPill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8F0FF',
        marginRight: 8,
    },
    categoryPillSelected: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    categoryPillTextSelected: {
        color: '#FFFFFF',
    },
    actionButtons: {
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8F0FF',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6C63FF',
    },
    guidelines: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    guidelinesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 8,
    },
    guidelinesText: {
        fontSize: 12,
        color: '#92400E',
        lineHeight: 18,
    },
    
    // Popup Styles
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    popupContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        minWidth: 280,
        maxWidth: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    popupHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2153',
        textAlign: 'center',
    },
    popupBody: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    popupMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    popupButtons: {
        borderTopWidth: 1,
        borderTopColor: '#E8F0FF',
    },
    popupButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FF',
        alignItems: 'center',
    },
    popupButtonLast: {
        borderBottomWidth: 0,
    },
    popupButtonCancel: {
        backgroundColor: '#F8FAFF',
    },
    popupButtonDestructive: {
        backgroundColor: '#FEF2F2',
    },
    popupButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6C63FF',
    },
    popupButtonTextCancel: {
        color: '#6B7280',
    },
    popupButtonTextDestructive: {
        color: '#DC2626',
    },
    
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        zIndex: 1000,
    },
    toastError: {
        backgroundColor: '#DC2626',
    },
    toastSuccess: {
        backgroundColor: '#059669',
    },
    toastText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});

export default CreatePost;