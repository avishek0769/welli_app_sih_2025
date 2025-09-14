import { StyleSheet } from 'react-native';
import colors from './colors';
import typography from './typography';

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    text: {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize.medium,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.fontSize.medium,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        fontSize: typography.fontSize.medium,
    },
});

export default globalStyles;