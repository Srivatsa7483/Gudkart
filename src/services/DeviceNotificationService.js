import { Platform } from 'react-native';

/**
 * DeviceNotificationService
 * Handles native mobile notifications using expo-notifications.
 *
 * expo-notifications is an optional native module — it requires a custom
 * Expo dev build (it does NOT work in Expo Go).
 *
 * If the package is not yet installed / linked, every method here degrades
 * gracefully to a no-op so the rest of the app continues to work.
 *
 * To fully enable push notifications:
 *   npx expo install expo-notifications
 *   npx expo run:android   (or run:ios)
 */

// ── Optional import — won't crash if the package is missing ────────────────
let Notifications = null;
try {
    Notifications = require('expo-notifications');

    // Configure foreground behaviour only when the module is available
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
} catch (_) {
    console.warn(
        '[DeviceNotificationService] expo-notifications is not installed. ' +
        'Run: npx expo install expo-notifications\n' +
        'Native push notifications will be disabled until then.'
    );
}

// ── Helper ─────────────────────────────────────────────────────────────────
const isAvailable = () => Notifications !== null;

const DeviceNotificationService = {
    /**
     * Request notification permissions from the user.
     * @returns {Promise<boolean>} True if granted, false otherwise.
     */
    requestPermissions: async () => {
        if (!isAvailable()) return false;
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('[DeviceNotificationService] Permission not granted.');
                return false;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            return true;
        } catch (error) {
            console.error('[DeviceNotificationService] requestPermissions error:', error);
            return false;
        }
    },

    /**
     * Schedule a local notification.
     * @param {Object} params
     * @param {string} params.title
     * @param {string} params.body
     * @param {Object} [params.data]
     * @param {number} [params.seconds=1]
     */
    showAlert: async ({ title, body, data = {}, seconds = 1 }) => {
        if (!isAvailable()) return; // silently skip — app still works
        try {
            const hasPermission = await DeviceNotificationService.requestPermissions();
            if (!hasPermission) return;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                    ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
                },
                trigger: { seconds },
            });
        } catch (error) {
            console.error('[DeviceNotificationService] showAlert error:', error);
        }
    },

    /**
     * Cancel all scheduled notifications.
     */
    cancelAll: async () => {
        if (!isAvailable()) return;
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};

export default DeviceNotificationService;