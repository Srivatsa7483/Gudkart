import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/api/Profileservice';

const EditProfileScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { uid, user, updateUser } = useAuth();

    const [name, setName] = useState(user?.fullName || user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [focusedField, setFocusedField] = useState(null);
    const [loading, setLoading] = useState(false);

    const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Name cannot be empty.');
            return;
        }
        if (!uid) {
            Alert.alert('Error', 'You must be logged in to update your profile.');
            return;
        }
        setLoading(true);
        try {
            const updated = await profileService.updateProfile(uid, {
                fullName: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                bio: bio.trim(),
            });
            // Merge the response back into AuthContext so the rest of the app sees fresh data
            updateUser(updated);
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            console.error('Update profile error:', e);
            const msg = e?.response?.data?.message || 'Could not update profile. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const inputBorderColor = field =>
        focusedField === field ? colors.inputBorderFocus : colors.inputBorder;

    return (
        <View style={[s.root, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* ── Header ── */}
            <View style={[s.header, { 
                backgroundColor: colors.surface, 
                borderBottomColor: colors.border,
                paddingTop: insets.top + 8
            }]}>
                <TouchableOpacity
                    style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Edit Profile</Text>

                <TouchableOpacity
                    style={[
                        s.saveBtn,
                        { backgroundColor: loading ? colors.border : colors.accent },
                    ]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            s.saveBtnText,
                            { color: loading ? colors.textMuted : colors.textInverse },
                        ]}
                    >
                        {loading ? 'Saving…' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Avatar ── */}
                    <View style={s.avatarSection}>
                        <View style={[s.avatarRing, { borderColor: colors.accent }]}>
                            <LinearGradient
                                colors={gradients.primary}
                                style={s.avatar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={s.avatarText}>{initials}</Text>
                            </LinearGradient>
                        </View>
                        <TouchableOpacity
                            style={[s.avatarEditBtn, { backgroundColor: colors.accent }]}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="pencil" size={14} color={colors.textInverse} />
                        </TouchableOpacity>
                        <Text style={[s.avatarHint, { color: colors.textSecondary }]}>
                            Tap to change photo
                        </Text>
                    </View>

                    {/* ── Membership Badge ── */}
                    {user?.createdAt ? (
                        <View style={[s.badgeRow, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30', borderWidth: 1 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="star" size={16} color={colors.accent} />
                                <Text style={[s.badgeText, { color: colors.accent }]}>Gold Member</Text>
                            </View>
                            <Text style={[s.badgeSub, { color: colors.textSecondary }]}>
                                Since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </Text>
                        </View>
                    ) : null}

                    {/* ── Form ── */}
                    <View style={[s.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>
                            PERSONAL INFORMATION
                        </Text>

                        {/* Full Name */}
                        <Field
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('name')}
                            colors={colors}
                            icon="person-outline"
                        />

                        {/* Email */}
                        <Field
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('email')}
                            colors={colors}
                            icon="mail-outline"
                        />

                        {/* Phone */}
                        <Field
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone"
                            keyboardType="phone-pad"
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('phone')}
                            colors={colors}
                            icon="call-outline"
                        />

                        {/* Bio */}
                        <Field
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself…"
                            multiline
                            numberOfLines={4}
                            onFocus={() => setFocusedField('bio')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('bio')}
                            colors={colors}
                            icon="document-text-outline"
                            isTextArea
                        />
                    </View>

                    {/* ── Stats Row (read-only) ── */}
                    <View style={[s.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>
                            ACCOUNT STATS
                        </Text>
                        <View style={s.statsRow}>
                            <StatItem icon="bag-handle-outline" value={user?.stats?.orders ?? '—'} label="Orders" colors={colors} />
                            <View style={[s.statDivider, { backgroundColor: colors.border }]} />
                            <StatItem icon="heart-outline" value={user?.stats?.wishlist ?? '—'} label="Wishlist" colors={colors} />
                            <View style={[s.statDivider, { backgroundColor: colors.border }]} />
                            <StatItem icon="star-outline" value={user?.stats?.reviews ?? '—'} label="Reviews" colors={colors} />
                        </View>
                    </View>

                    {/* ── Save Button (bottom) ── */}
                    <TouchableOpacity
                        style={[
                            s.saveBtnLarge,
                            { backgroundColor: loading ? colors.border : colors.accent },
                        ]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                s.saveBtnLargeText,
                                { color: loading ? colors.textMuted : colors.textInverse },
                            ]}
                        >
                            {loading ? 'Saving Changes…' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({
    label, value, onChangeText, placeholder, keyboardType,
    autoCapitalize, onFocus, onBlur, borderColor, colors, icon,
    multiline, numberOfLines, isTextArea,
}) => (
    <View style={s.fieldWrapper}>
        <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View
            style={[
                s.inputRow,
                {
                    backgroundColor: colors.card,
                    borderColor,
                    height: isTextArea ? undefined : 52,
                    alignItems: isTextArea ? 'flex-start' : 'center',
                    paddingTop: isTextArea ? 14 : 0,
                },
            ]}
        >
            <Ionicons name={icon} size={18} color={colors.textMuted} style={s.inputIcon} />
            <TextInput
                style={[
                    s.input,
                    { color: colors.textPrimary },
                    isTextArea && { height: 90, textAlignVertical: 'top' },
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType || 'default'}
                autoCapitalize={autoCapitalize || 'words'}
                onFocus={onFocus}
                onBlur={onBlur}
                multiline={multiline}
                numberOfLines={numberOfLines}
            />
        </View>
    </View>
);

const StatItem = ({ icon, value, label, colors }) => (
    <View style={s.statItem}>
        <Ionicons name={icon} size={20} color={colors.accent} style={{ marginBottom: 4 }} />
        <Text style={[s.statValue, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[s.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    headerBtnIcon: { fontSize: 20, fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
    saveBtn: {
        paddingHorizontal: 18, paddingVertical: 8,
        borderRadius: 20,
    },
    saveBtnText: { fontSize: 14, fontWeight: '700' },

    scroll: { paddingHorizontal: 20, paddingTop: 24 },

    avatarSection: { alignItems: 'center', marginBottom: 20 },
    avatarRing: {
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 84, height: 84, borderRadius: 42,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
    avatarEditBtn: {
        position: 'absolute', bottom: 24, right: '32%',
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarEditIcon: { fontSize: 13 },
    avatarHint: { fontSize: 12, marginTop: 4 },

    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        marginBottom: 20,
    },
    badgeText: { fontSize: 14, fontWeight: '700' },
    badgeSub: { fontSize: 12 },

    formCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
        marginBottom: 14,
    },
    fieldWrapper: { marginBottom: 14 },
    fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 14,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, fontSize: 15, fontWeight: '500' },

    statsCard: {
        borderRadius: 18, borderWidth: 1,
        padding: 16, marginBottom: 20,
    },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
    statIcon: { fontSize: 20, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 12 },
    statDivider: { width: 1, height: 44 },

    saveBtnLarge: {
        borderRadius: 16, paddingVertical: 16,
        alignItems: 'center', marginBottom: 8,
    },
    saveBtnLargeText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});

export default EditProfileScreen;