import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    StatusBar,
    Alert,
    Platform,
    SafeAreaView,
} from 'react-native';

import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
    const { colors, isDark, toggle: toggleTheme } = useTheme();

    const [notifications, setNotifications] = useState(true);
    const [dealAlerts, setDealAlerts] = useState(true);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [biometrics, setBiometrics] = useState(false);
    const [language, setLanguage] = useState('English');

    const handleDarkToggle = (val) => {
        if (val !== isDark) {
            toggleTheme();
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    // dispatch(logout());
                    // navigation.replace('Auth');
                    Alert.alert('Logged out');
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => Alert.alert('Account deletion requested'),
                },
            ],
        );
    };

    return (
        <View style={[s.root, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* ── Header ── */}
            <SafeAreaView style={{ backgroundColor: colors.surface }}>
                <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* ── PREFERENCES ── */}
                <SectionHeader label="PREFERENCES" colors={colors} />
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

                    <ToggleRow
                        icon="moon-outline"
                        iconBg="#3D2A5E"
                        title="Dark Mode"
                        subtitle={isDark ? 'Currently ON' : 'Currently OFF'}
                        value={isDark}
                        onValueChange={handleDarkToggle}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <ToggleRow
                        icon="notifications-outline"
                        iconBg="#4A2060"
                        title="Push Notifications"
                        subtitle="Deals, offers & updates"
                        value={notifications}
                        onValueChange={setNotifications}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <ToggleRow
                        icon="flash-outline"
                        iconBg="#1E3A50"
                        title="Flash Deal Alerts"
                        subtitle="Be first to know"
                        value={dealAlerts}
                        onValueChange={setDealAlerts}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="language-outline"
                        iconBg="#1A3A2A"
                        title="Language"
                        subtitle={language}
                        onPress={() => Alert.alert('Language', 'Coming soon!')}
                        colors={colors}
                    />
                </View>

                {/* ── NOTIFICATIONS ── */}
                <SectionHeader label="NOTIFICATION SETTINGS" colors={colors} />
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <ToggleRow
                        icon="bag-handle-outline"
                        iconBg="#1E3A50"
                        title="Order Updates"
                        subtitle="Shipping & delivery"
                        value={orderUpdates}
                        onValueChange={setOrderUpdates}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <ToggleRow
                        icon="mail-outline"
                        iconBg="#2A1A4A"
                        title="Email Updates"
                        subtitle="Newsletters & promotions"
                        value={emailUpdates}
                        onValueChange={setEmailUpdates}
                        colors={colors}
                    />
                </View>

                {/* ── SECURITY ── */}
                <SectionHeader label="SECURITY" colors={colors} />
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <ToggleRow
                        icon="finger-print-outline"
                        iconBg="#1A3030"
                        title="Biometric Login"
                        subtitle="Fingerprint / Face ID"
                        value={biometrics}
                        onValueChange={setBiometrics}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="key-outline"
                        iconBg="#2A1A0A"
                        title="Change Password"
                        subtitle="Update your password"
                        onPress={() => navigation.navigate('ChangePassword')}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="shield-checkmark-outline"
                        iconBg="#1A2A1A"
                        title="Privacy Settings"
                        subtitle="Manage your data"
                        onPress={() => Alert.alert('Privacy', 'Coming soon!')}
                        colors={colors}
                    />
                </View>

                {/* ── SUPPORT & LEGAL ── */}
                <SectionHeader label="SUPPORT & LEGAL" colors={colors} />
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <NavRow
                        icon="chatbubble-ellipses-outline"
                        iconBg="#1A3A4A"
                        title="Help & Support"
                        subtitle="Chat with us"
                        onPress={() => Alert.alert('Support', 'Coming soon!')}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="document-text-outline"
                        iconBg="#2A2A1A"
                        title="Terms & Conditions"
                        subtitle="Read our terms"
                        onPress={() => Alert.alert('Terms', 'Coming soon!')}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="lock-closed-outline"
                        iconBg="#1A2A3A"
                        title="Privacy Policy"
                        subtitle="How we use your data"
                        onPress={() => Alert.alert('Privacy Policy', 'Coming soon!')}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <NavRow
                        icon="information-circle-outline"
                        iconBg="#2A1A2A"
                        title="App Version"
                        subtitle="v1.0.0"
                        onPress={null}
                        colors={colors}
                        hideArrow
                    />
                </View>

                {/* ── ACCOUNT ACTIONS ── */}
                <SectionHeader label="ACCOUNT" colors={colors} />
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                        style={s.actionRow}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <View style={[s.iconBox, { backgroundColor: colors.accent + '20' }]}>
                            <Ionicons name="log-out-outline" size={20} color={colors.accent} />
                        </View>
                        <View style={s.rowTexts}>
                            <Text style={[s.rowTitle, { color: colors.accent }]}>Logout</Text>
                            <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                                Sign out of your account
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <Divider colors={colors} />

                    <TouchableOpacity
                        style={s.actionRow}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}
                    >
                        <View style={[s.iconBox, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </View>
                        <View style={s.rowTexts}>
                            <Text style={[s.rowTitle, { color: colors.error }]}>
                                Delete Account
                            </Text>
                            <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                                Permanently remove your data
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 48 }} />
            </ScrollView>
        </View>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, colors }) => (
    <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
);

const Divider = ({ colors }) => (
    <View style={[s.divider, { backgroundColor: colors.border }]} />
);

const ToggleRow = ({ icon, iconBg, title, subtitle, value, onValueChange, colors }) => (
    <View style={s.actionRow}>
        <View style={[s.iconBox, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
        <View style={s.rowTexts}>
            <Text style={[s.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[s.rowSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
                false: colors.border,
                true: colors.primary + '80',
            }}
            thumbColor={value ? colors.accent : colors.textMuted}
            ios_backgroundColor={colors.border}
        />
    </View>
);

const NavRow = ({ icon, iconBg, title, subtitle, onPress, colors, hideArrow }) => (
    <TouchableOpacity
        style={s.actionRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
    >
        <View style={[s.iconBox, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
        <View style={s.rowTexts}>
            <Text style={[s.rowTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[s.rowSub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        {!hideArrow && (
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
    </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 0) + 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    backIcon: { fontSize: 20, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },

    scroll: { paddingHorizontal: 16, paddingTop: 20 },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
        marginBottom: 8, marginLeft: 4, marginTop: 4,
    },
    card: {
        borderRadius: 18, borderWidth: 1,
        overflow: 'hidden', marginBottom: 16,
    },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    rowIcon: { fontSize: 18 },
    rowTexts: { flex: 1 },
    rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    rowSub: { fontSize: 12 },
    arrow: { fontSize: 22, fontWeight: '300' },

    divider: { height: 1, marginLeft: 70 },
});

export default SettingsScreen;