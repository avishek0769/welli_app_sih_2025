import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Alert,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const CreatePost = ({ onCreatePost, onCancel }) => {
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

    const categories = [
        'General',
        'Anxiety',
        'Depression',
        'Academic Stress',
        'Mindfulness',
        'Progress',
        'Sleep Issues',
        'Nature Therapy',
        'Social Support',
        'Self Care'
    ];

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
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };

        Alert.alert(
            'Select Image',
            'Choose an option to add an image',
            [
                { 
                    text: 'Cancel', 
                    style: 'cancel' 
                },
                {
                    text: 'Camera',
                    onPress: async () => {
                        const hasPermission = await requestCameraPermission();
                        if (hasPermission) {
                            launchCamera(options, handleImageResponse);
                        } else {
                            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
                        }
                    }
                },
                {
                    text: 'Gallery',
                    onPress: () => {
                        launchImageLibrary(options, handleImageResponse);
                    }
                },
                ...(selectedImage ? [{
                    text: 'Remove Image',
                    onPress: () => setSelectedImage(null),
                    style: 'destructive'
                }] : [])
            ]
        );
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
                Alert.alert(
                    'File Too Large', 
                    'Please select an image smaller than 5MB.',
                    [{ text: 'OK' }]
                );
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
        }
    };

    const handlePost = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please write something to share with the community.');
            return;
        }

        setIsPosting(true);
        
        // Simulate posting delay
        setTimeout(() => {
            onCreatePost({
                content: content.trim(),
                category: selectedCategory,
                image: selectedImage?.uri || null, // Pass the URI for display
                imageData: selectedImage, // Pass full image data if needed for upload
            });
            
            // Reset form
            setContent('');
            setSelectedCategory('General');
            setSelectedImage(null);
            setIsPosting(false);
        }, 1000);
    };

    const CategoryPill = ({ category, isSelected, onPress }) => (
        <TouchableOpacity
            style={[
                styles.categoryPill,
                isSelected && styles.categoryPillSelected
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.categoryPillText,
                isSelected && styles.categoryPillTextSelected
            ]}>
                {category}
            </Text>
        </TouchableOpacity>
    );

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
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>Y</Text>
                        </View>
                        <Text style={styles.username}>Posting as You</Text>
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
                                onPress={() => setSelectedImage(null)}
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

                    {/* Categories */}
                    <View style={styles.categorySection}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesScroll}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {categories.map((category) => (
                                <CategoryPill
                                    key={category}
                                    category={category}
                                    isSelected={selectedCategory === category}
                                    onPress={() => setSelectedCategory(category)}
                                />
                            ))}
                        </ScrollView>
                    </View>

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
        backgroundColor: '#6C63FF',
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
});

export default CreatePost;