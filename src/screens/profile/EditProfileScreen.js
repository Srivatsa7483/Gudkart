import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/api/Profileservice';

const EditProfileScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { uid, user, updateUser } = useAuth();

    // ── Local form state ─────────────────────────────────────────────────────
    const [photoUri, setPhotoUri] = useState(
        route?.params?.photoUri ?? user?.photoURL ?? user?.profilePhoto ?? null
    );
    const [name, setName] = useState(user?.fullName || user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [dob, setDob] = useState(user?.dateOfBirth || '');
    const [focusedField, setFocusedField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

    // Tracks when we're in the camera/gallery OS flow — prevents focus-effect
    // from resetting the newly-selected photo when the screen regains focus.
    const cameraActiveRef = useRef(false);

    // ── Auto-fill on every focus (picks up latest user from context) ─────────
    useFocusEffect(
        React.useCallback(() => {
            // Skip reset if we are returning from camera/gallery
            if (cameraActiveRef.current) {
                cameraActiveRef.current = false;
                return;
            }
            if (!user) return;

            setName(user.fullName || user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || user.phoneNumber || '');
            setBio(user.bio || '');
            setGender(user.gender || '');
            setDob(user.dateOfBirth || '');
            // Prefer a freshly-taken photo (stored in route.params) over the
            // possibly-stale user.photoURL saved in context.
            const paramPhoto = route?.params?.photoUri;
            setPhotoUri(paramPhoto ?? user.photoURL ?? user.profilePhoto ?? null);
        }, [user])
    );

    const initials = (name || '')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    // ── Photo Picker Helpers ─────────────────────────────────────────────────

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
            return false;
        }
        return true;
    };

    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Gallery access is needed to pick a photo.');
            return false;
        }
        return true;
    };

    // Persist the current photoUri into route params before launching the camera.
    // On Android, ImagePicker.launchCameraAsync briefly backgrounds the app which
    // can remount this screen — storing the value in params lets useState re-init
    // from route?.params?.photoUri and prevents the photo from being lost.
    const persistPhotoToParams = (uri) => {
        navigation.setParams({ photoUri: uri ?? null });
    };

    const openCamera = async () => {
        setPhotoPickerVisible(false);
        const granted = await requestCameraPermission();
        if (!granted) return;

        // Flag that we are entering camera OS flow — prevents useFocusEffect
        // from resetting form state when we return.
        cameraActiveRef.current = true;
        // Checkpoint current draft photo in route.params so it survives any
        // Android activity recreation while the camera is open.
        persistPhotoToParams(photoUri);

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const newUri = result.assets[0].uri;
            setPhotoUri(newUri);
            persistPhotoToParams(newUri);
        } else {
            // Camera cancelled — clear the camera flag so focus effect runs next time
            cameraActiveRef.current = false;
        }
    };

    const openGallery = async () => {
        setPhotoPickerVisible(false);
        const granted = await requestGalleryPermission();
        if (!granted) return;

        cameraActiveRef.current = true;
        persistPhotoToParams(photoUri);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const newUri = result.assets[0].uri;
            setPhotoUri(newUri);
            persistPhotoToParams(newUri);
        } else {
            cameraActiveRef.current = false;
        }
    };

    const removePhoto = () => {
        setPhotoPickerVisible(false);
        setPhotoUri(null);
    };

    // ── Save ─────────────────────────────────────────────────────────────────

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

        // Build the patch we want to apply
        const localPatch = {
            fullName: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            bio: bio.trim(),
            gender: gender.trim(),
            dateOfBirth: dob.trim(),
            photoURL: photoUri || null,
        };

        // ✔ Optimistic update — update context immediately so ProfileScreen
        //   reflects changes right away, even before the API call completes.
        updateUser(localPatch);

        let alertTitle = 'Success';
        let alertMsg = 'Profile updated successfully!';

        try {
            const serverProfile = await profileService.updateProfile(uid, localPatch);
            // Merge server response on top of the optimistic patch to pick up
            // any server-computed fields (e.g. updatedAt) without losing auth fields.
            if (serverProfile && typeof serverProfile === 'object') {
                updateUser(serverProfile);
            }
        } catch (e) {
            console.error('Update profile error:', e);
            // Local context is already updated optimistically — don't revert,
            // just inform the user the server sync failed.
            alertTitle = 'Saved Locally';
            alertMsg = 'Profile saved on device. It will sync when the server is reachable.';
        } finally {
            setLoading(false);
        }

        Alert.alert(alertTitle, alertMsg, [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);
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
                    <Text style={[s.saveBtnText, { color: loading ? colors.textMuted : colors.textInverse }]}>
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
                        <TouchableOpacity
                            onPress={() => setPhotoPickerVisible(true)}
                            activeOpacity={0.85}
                        >
                            <View style={[s.avatarRing, { borderColor: colors.accent }]}>
                                {photoUri ? (
                                    <Image
                                        source={{ uri: photoUri }}
                                        style={s.avatarImage}
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={gradients.primary}
                                        style={s.avatar}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={s.avatarText}>{initials}</Text>
                                    </LinearGradient>
                                )}
                            </View>
                            <View style={[s.avatarEditBtn, { backgroundColor: colors.accent }]}>
                                <Ionicons name="camera" size={14} color={colors.textInverse} />
                            </View>
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

                        {/* Gender */}
                        <Field
                            label="Gender"
                            value={gender}
                            onChangeText={setGender}
                            placeholder="e.g. Male, Female, Other"
                            onFocus={() => setFocusedField('gender')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('gender')}
                            colors={colors}
                            icon="people-outline"
                        />

                        {/* Date of Birth */}
                        <Field
                            label="Date of Birth"
                            value={dob}
                            onChangeText={setDob}
                            placeholder="e.g. 1990-01-01"
                            onFocus={() => setFocusedField('dob')}
                            onBlur={() => setFocusedField(null)}
                            borderColor={inputBorderColor('dob')}
                            colors={colors}
                            icon="calendar-outline"
                        />
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
                        <Text style={[s.saveBtnLargeText, { color: loading ? colors.textMuted : colors.textInverse }]}>
                            {loading ? 'Saving Changes…' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Photo Picker Bottom Sheet Modal ── */}
            <Modal
                visible={photoPickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPhotoPickerVisible(false)}
            >
                <TouchableOpacity
                    style={s.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPhotoPickerVisible(false)}
                >
                    <View style={[s.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {/* Handle bar */}
                        <View style={[s.sheetHandle, { backgroundColor: colors.border }]} />

                        <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>
                            Profile Photo
                        </Text>
                        <Text style={[s.sheetSubtitle, { color: colors.textMuted }]}>
                            Choose how to update your photo
                        </Text>

                        {/* Camera */}
                        <TouchableOpacity
                            style={[s.sheetOption, { borderColor: colors.border }]}
                            onPress={openCamera}
                            activeOpacity={0.8}
                        >
                            <View style={[s.sheetOptionIcon, { backgroundColor: colors.accent + '20' }]}>
                                <Ionicons name="camera" size={22} color={colors.accent} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.sheetOptionLabel, { color: colors.textPrimary }]}>Take Photo</Text>
                                <Text style={[s.sheetOptionSub, { color: colors.textMuted }]}>Use your camera</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </TouchableOpacity>

                        {/* Gallery */}
                        <TouchableOpacity
                            style={[s.sheetOption, { borderColor: colors.border }]}
                            onPress={openGallery}
                            activeOpacity={0.8}
                        >
                            <View style={[s.sheetOptionIcon, { backgroundColor: '#7B5EEA20' }]}>
                                <Ionicons name="image" size={22} color="#7B5EEA" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.sheetOptionLabel, { color: colors.textPrimary }]}>Choose from Gallery</Text>
                                <Text style={[s.sheetOptionSub, { color: colors.textMuted }]}>Pick from your photos</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </TouchableOpacity>

                        {/* Remove (only if photo exists) */}
                        {photoUri ? (
                            <TouchableOpacity
                                style={[s.sheetOption, { borderColor: colors.border }]}
                                onPress={removePhoto}
                                activeOpacity={0.8}
                            >
                                <View style={[s.sheetOptionIcon, { backgroundColor: '#FF6B6B20' }]}>
                                    <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.sheetOptionLabel, { color: '#FF6B6B' }]}>Remove Photo</Text>
                                    <Text style={[s.sheetOptionSub, { color: colors.textMuted }]}>Revert to initials</Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        {/* Cancel */}
                        <TouchableOpacity
                            style={[s.sheetCancel, { backgroundColor: colors.border + '50' }]}
                            onPress={() => setPhotoPickerVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={[s.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    avatarImage: {
        width: 84, height: 84, borderRadius: 42,
    },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
    avatarEditBtn: {
        position: 'absolute', bottom: 24, right: '32%',
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
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

    // Photo Picker Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        paddingTop: 12,
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        alignSelf: 'center', marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 18, fontWeight: '800', letterSpacing: 0.2,
        marginBottom: 4,
    },
    sheetSubtitle: {
        fontSize: 13, fontWeight: '400',
        marginBottom: 20,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    sheetOptionIcon: {
        width: 46, height: 46, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    sheetOptionLabel: { fontSize: 15, fontWeight: '600' },
    sheetOptionSub: { fontSize: 12, marginTop: 2 },
    sheetCancel: {
        marginTop: 16,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    sheetCancelText: { fontSize: 15, fontWeight: '600' },
});

export default EditProfileScreen;