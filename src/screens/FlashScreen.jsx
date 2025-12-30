import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

export default function FlashScreen() {
    const navigation = useNavigation();
    const { currentUser } = useUser();
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [minTimePassed, setMinTimePassed] = useState(false);
    const [maxTimePassed, setMaxTimePassed] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        const minTimer = setTimeout(() => {
            setMinTimePassed(true);
        }, 1500);

        const maxTimer = setTimeout(() => {
            setMaxTimePassed(true);
        }, 4000);

        return () => {
            clearTimeout(minTimer);
            clearTimeout(maxTimer);
        };
    }, []);

    useEffect(() => {
        if (minTimePassed) {
            if (currentUser) {
                navigation.replace('TabNavigator');
            } else if (maxTimePassed) {
                navigation.replace('Login');
            }
        }
    }, [minTimePassed, maxTimePassed, currentUser, navigation]);

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.logoContainer,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Image 
                    source={require('../assets/welli_logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});