import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Avatar = ({ source, size }) => {
    return (
        <View style={[styles.avatarContainer, { width: size, height: size }]}>
            <Image source={source} style={styles.avatarImage} />
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#E8E8E8',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default Avatar;