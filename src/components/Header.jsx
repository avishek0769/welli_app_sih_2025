import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = () => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.appLogo}>
                    <Image 
                        source={require('../assets/welli_logo.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>Welli</Text>
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

export default Header;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 7,
        paddingTop: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#6C63FF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appLogo: {
        marginRight: 0,
    },
    logoImage: {
        width: 95,
        height: 95,
        marginLeft: -10,
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
})