import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import addressService from '../../services/api/addressService';

const ADDRESS_TYPES = ['shipping', 'billing'];
const TYPE_LABELS = { shipping: 'Shipping', billing: 'Billing' };

const AddEditAddressScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const { user } = useAuth();
    const existingAddress = route.params?.address;
    const isEdit = !!existingAddress;

    // Backend fields: firstName, lastName, addressLine, city, state, pincode, phone, landmark, type, isDefault
    const [form, setForm] = useState({
        firstName: existingAddress?.firstName || '',
        lastName: existingAddress?.lastName || '',
        phone: existingAddress?.phone || '',
        addressLine: existingAddress?.addressLine || existingAddress?.address || '',
        landmark: existingAddress?.landmark || '',
        city: existingAddress?.city || '',
        state: existingAddress?.state || '',
        pincode: existingAddress?.pincode || '',
        type: existingAddress?.type || 'shipping',
        isDefault: existingAddress?.isDefault ?? false,
        ...(isEdit && existingAddress?.id ? { id: existingAddress.id } : {}),
    });

    const [focusedField, setFocusedField] = useState(null);
    const [saving, setSaving] = useState(false);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const validate = () => {
        const { firstName, lastName, addressLine, city, state, pincode } = form;
        if (!firstName.trim()) return 'First name is required.';
        if (!lastName.trim()) return 'Last name is required.';
        if (!addressLine.trim()) return 'Address line is required.';
        if (!city.trim()) return 'City is required.';
        if (!state.trim()) return 'State is required.';
        if (!pincode.trim() || pincode.length < 6) return 'Valid 6-digit pincode is required.';
        return null;
    };

    const handleSave = async () => {
        const error = validate();
        if (error) {
            Alert.alert('Incomplete Form', error);
            return;
        }

        if (!user?.uid) {
            Alert.alert('Error', 'You must be logged in to save an address.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
                addressLine: form.addressLine.trim(),
                landmark: form.landmark.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                type: form.type,
                isDefault: form.isDefault,
                ...(isEdit && form.id ? { id: form.id } : {}),
            };

            await addressService.addAddress(user.uid, payload);

            Alert.alert(
                'Success ✓',
                `Address ${isEdit ? 'updated' : 'saved'} successfully!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to save address. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    const renderInput = (label, key, placeholder, options = {}) => {
        const { keyboard = 'default', multiline = false, maxLength } = options;
        return (
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
                <View
                    style={[
                        styles.inputWrapper,
                        {
                            backgroundColor: colors.card,
                            borderColor: focusedField === key ? colors.primary : colors.border,
                        },
                        multiline && styles.multilineWrapper,
                    ]}
                >
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary }, multiline && styles.multilineInput]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textMuted}
                        value={form[key]}
                        onChangeText={(val) => updateField(key, val)}
                        onFocus={() => setFocusedField(key)}
                        onBlur={() => setFocusedField(null)}
                        keyboardType={keyboard}
                        multiline={multiline}
                        maxLength={maxLength}
                        autoCapitalize={keyboard === 'default' ? 'words' : 'none'}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {isEdit ? 'Edit Address' : 'New Address'}
                </Text>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.formContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Contact ── */}
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Details</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>{renderInput('First Name *', 'firstName', 'First name')}</View>
                        <View style={{ flex: 1 }}>{renderInput('Last Name *', 'lastName', 'Last name')}</View>
                    </View>
                    {renderInput('Phone Number', 'phone', '10-digit mobile', { keyboard: 'phone-pad', maxLength: 13 })}

                    {/* ── Address ── */}
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 28 }]}>
                        Shipping Address
                    </Text>
                    {renderInput('Address Line *', 'addressLine', 'Flat / House No., Building, Street', { multiline: true })}
                    {renderInput('Landmark', 'landmark', 'Near school, hospital etc. (optional)')}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            {renderInput('Pincode *', 'pincode', '6-digit PIN', { keyboard: 'number-pad', maxLength: 6 })}
                        </View>
                        <View style={{ flex: 1 }}>
                            {renderInput('City *', 'city', 'City name')}
                        </View>
                    </View>
                    {renderInput('State *', 'state', 'State name')}

                    {/* ── Address Type ── */}
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 28 }]}>
                        Address Type
                    </Text>
                    <View style={styles.typeContainer}>
                        {ADDRESS_TYPES.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.typeChip,
                                    {
                                        backgroundColor: form.type === t ? colors.primary : colors.card,
                                        borderColor: form.type === t ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => updateField('type', t)}
                            >
                                <Ionicons
                                    name={t === 'shipping' ? 'home' : 'document-text-outline'}
                                    size={18}
                                    color={form.type === t ? '#FFF' : colors.textSecondary}
                                />
                                <Text style={[styles.typeChipText, { color: form.type === t ? '#FFF' : colors.textSecondary }]}>
                                    {TYPE_LABELS[t]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Default Toggle ── */}
                    <View style={[styles.defaultRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.defaultLabel, { color: colors.textPrimary }]}>Set as Default Address</Text>
                            <Text style={[styles.defaultSub, { color: colors.textMuted }]}>Auto-select this at checkout</Text>
                        </View>
                        <Switch
                            value={form.isDefault}
                            onValueChange={(val) => updateField('isDefault', val)}
                            trackColor={{ false: colors.border, true: colors.primary + '80' }}
                            thumbColor={form.isDefault ? colors.primary : colors.textMuted}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={(gradients?.button || []).every(Boolean) ? gradients.button : ['#7B5EEA', '#5A3EC8']}
                        style={styles.saveBtnGradient}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                <Text style={styles.saveBtnText}>
                                    {isEdit ? 'Update Address' : 'Save Address'}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 12,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800' },

    formContent: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
    row: { flexDirection: 'row', gap: 12 },

    inputContainer: { marginBottom: 18 },
    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputWrapper: {
        borderRadius: 14, borderWidth: 1.5,
        paddingHorizontal: 14, height: 54, justifyContent: 'center',
    },
    multilineWrapper: { height: 90, paddingTop: 12, alignItems: 'flex-start', justifyContent: 'flex-start' },
    input: { fontSize: 15, fontWeight: '500' },
    multilineInput: { height: 68, textAlignVertical: 'top' },

    typeContainer: { flexDirection: 'row', gap: 12 },
    typeChip: {
        flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    typeChipText: { fontSize: 14, fontWeight: '700' },

    defaultRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12,
    },
    defaultLabel: { fontSize: 15, fontWeight: '700' },
    defaultSub: { fontSize: 12, marginTop: 2 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36 },
    saveBtn: { borderRadius: 16, overflow: 'hidden' },
    saveBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, gap: 8,
    },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default AddEditAddressScreen;
