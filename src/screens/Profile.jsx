import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PROFILE_KEY = '@Welli_profile';

const validatePassword = (p) => {
    if (!p) return 'Password is required';
    if (p.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(p)) return 'Must include uppercase, lowercase, and number';
    return null;
};

const Profile = ({ navigation }) => {
    const [profile, setProfile] = useState({
        anonymousName: '',
        age: '',
        gender: '',
        institution: '',
        receiveMessages: true,
        receiveNotifications: true,
        showAge: false,
        publicProfile: false,
    });

    const [passwords, setPasswords] = useState({
        current: '',
        newPassword: '',
        confirmNew: '',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(DEFAULT_PROFILE_KEY);
                if (raw) setProfile(JSON.parse(raw));
            } catch (e) {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const saveProfile = async () => {
        // basic validation
        if (!profile.anonymousName) {
            return Alert.alert('Validation', 'Anonymous name is required');
        }
        if (profile.age && (isNaN(profile.age) || +profile.age < 13 || +profile.age > 120)) {
            return Alert.alert('Validation', 'Please enter a valid age (13-120) or leave empty');
        }

        // password change flow (optional)
        if (passwords.newPassword || passwords.confirmNew) {
            const err = validatePassword(passwords.newPassword);
            if (err) return Alert.alert('Password error', err);
            if (passwords.newPassword !== passwords.confirmNew) return Alert.alert('Password error', 'Passwords do not match');
            // NOTE: integrate real password change with backend here
            // For now just clear password fields after "save"
        }

        try {
            await AsyncStorage.setItem(DEFAULT_PROFILE_KEY, JSON.stringify(profile));
            setPasswords({ current: '', newPassword: '', confirmNew: '' });
            Alert.alert('Saved', 'Profile updated successfully');
        } catch (e) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    const generateAnonymousName = () => {
        const list = [
            'WellnessSeeker', 'MindfulStudent', 'HopeBuilder', 'CalmWanderer', 'PeacefulSoul',
            'BraveHeart', 'QuietMind', 'StrongSpirit', 'GentleWarrior', 'SereneStudent',
        ];
        const base = list[Math.floor(Math.random() * list.length)];
        const num = Math.floor(Math.random() * 9000) + 100;
        setProfile({ ...profile, anonymousName: `${base}${num}` });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                        <Icon name="arrow-back" size={24} color="#1F2153" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Anonymous Name</Text>
                    <View style={styles.row}>
                        <TextInput
                            value={profile.anonymousName}
                            onChangeText={(t) => setProfile({ ...profile, anonymousName: t })}
                            placeholder="Anonymous name"
                            style={styles.input}
                            maxLength={30}
                        />
                        <TouchableOpacity style={styles.iconBtn} onPress={generateAnonymousName}>
                            <Icon name="auto-awesome" size={20} color="#6C63FF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Age (optional)</Text>
                    <TextInput
                        value={profile.age}
                        onChangeText={(t) => setProfile({ ...profile, age: t.replace(/[^0-9]/g, '') })}
                        placeholder="Age"
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pills}>
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.pill,
                                    profile.gender === g && styles.pillActive
                                ]}
                                onPress={() => setProfile({ ...profile, gender: g })}
                            >
                                <Text style={[styles.pillText, profile.gender === g && styles.pillTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Institution (optional)</Text>
                    <TextInput
                        value={profile.institution}
                        onChangeText={(t) => setProfile({ ...profile, institution: t })}
                        placeholder="School / College"
                        style={styles.input}
                        maxLength={50}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Privacy & Messaging</Text>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Allow messages from others</Text>
                        <Switch
                            value={!!profile.receiveMessages}
                            onValueChange={(v) => setProfile({ ...profile, receiveMessages: v })}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Receive notifications</Text>
                        <Switch
                            value={!!profile.receiveNotifications}
                            onValueChange={(v) => setProfile({ ...profile, receiveNotifications: v })}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Show age on profile</Text>
                        <Switch
                            value={!!profile.showAge}
                            onValueChange={(v) => setProfile({ ...profile, showAge: v })}
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Public profile</Text>
                        <Switch
                            value={!!profile.publicProfile}
                            onValueChange={(v) => setProfile({ ...profile, publicProfile: v })}
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Change Password</Text>

                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                        value={passwords.current}
                        onChangeText={(t) => setPasswords({ ...passwords, current: t })}
                        placeholder="Current password"
                        secureTextEntry
                        style={styles.input}
                        maxLength={64}
                    />

                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        value={passwords.newPassword}
                        onChangeText={(t) => setPasswords({ ...passwords, newPassword: t })}
                        placeholder="New password"
                        secureTextEntry
                        style={styles.input}
                        maxLength={64}
                    />

                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextInput
                        value={passwords.confirmNew}
                        onChangeText={(t) => setPasswords({ ...passwords, confirmNew: t })}
                        placeholder="Confirm new password"
                        secureTextEntry
                        style={styles.input}
                        maxLength={64}
                    />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={loading}>
                    <Text style={styles.saveText}>{loading ? 'Loading...' : 'Save Profile'}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' },
    content: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '700', color: '#1F2153' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    label: { color: '#6B7280', marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: '#F7F9FF', borderRadius: 10, padding: 12, marginBottom: 12, color: '#1F2153' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { marginLeft: 8, padding: 10, backgroundColor: '#F0F4FF', borderRadius: 10 },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F7F9FF', marginRight: 8, marginBottom: 8 },
    pillActive: { backgroundColor: '#6C63FF' },
    pillText: { color: '#6B7280' },
    pillTextActive: { color: '#fff', fontWeight: '700' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#1F2153' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    switchLabel: { color: '#1F2153', fontWeight: '600' },
    saveBtn: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveText: { color: '#fff', fontWeight: '700' },
});

export default Profile;