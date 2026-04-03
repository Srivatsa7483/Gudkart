import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../hooks/useTheme';

const NotificationBadge = ({ iconSize = 24, iconColor, showLabel = false }) => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { getUnreadCount } = useNotifications();
    const unreadCount = getUnreadCount();

    const handlePress = () => {
        navigation.navigate('Notifications');
    };

    const finalIconColor = iconColor || colors.textPrimary;

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={iconSize} color={finalIconColor} />
                {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
                        <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </View>
            {showLabel && (
                <Text style={[styles.label, { color: colors.textMuted }]}>Notifications</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
        marginTop: 4,
    },
});

export default NotificationBadge;