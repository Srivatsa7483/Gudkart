import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const AddAddressScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const { onAddressAdded, addressToEdit } = route.params || {};

    const [form, setForm] = useState(addressToEdit || { name: '', phone: '', address: '', landmark: '', city: '', state: '', pincode: '', isDefault: false });
    const [errors, setErrors] = useState({});

    const update = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid 10-digit number required';
        if (!form.address.trim()) e.address = 'Address is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.state.trim()) e.state = 'State is required';
        if (!form.pincode.trim() || form.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        if (onAddressAdded) {
            // If editing, use existing ID. If new, generate one.
            const savedAddress = {
                ...form,
                id: form.id || Date.now().toString()
            };
            onAddressAdded(savedAddress);
        }
        navigation.goBack();
    };

    const Field = ({ label, field, placeholder, keyboardType = 'default', maxLength }) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                style={[styles.input, errors[field] && styles.inputError]}
                placeholder={placeholder} placeholderTextColor={colors.textMuted}
                value={form[field]} onChangeText={val => update(field, val)}
                keyboardType={keyboardType} maxLength={maxLength}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{addressToEdit ? 'Edit Address' : 'Add New Address'}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
                        <Field label="Full Name *" field="name" placeholder="e.g. Rahul Kumar" />
                        <Field label="Phone Number *" field="phone" placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} />
                        <Field label="Address Line *" field="address" placeholder="Flat / House no, Building, Street" />
                        <Field label="Landmark (optional)" field="landmark" placeholder="Near landmark" />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}><Field label="City *" field="city" placeholder="City" /></View>
                            <View style={{ flex: 1, marginLeft: 8 }}><Field label="Pincode *" field="pincode" placeholder="6-digit PIN" keyboardType="numeric" maxLength={6} /></View>
                        </View>
                        <Field label="State *" field="state" placeholder="e.g. Karnataka" />
                        <TouchableOpacity style={styles.defaultToggle} onPress={() => update('isDefault', !form.isDefault)}>
                            <View style={[styles.checkboxBox, form.isDefault && styles.checkboxChecked]}>
                                {form.isDefault && <Ionicons name="checkmark" size={14} color={isDark ? '#1A0B2E' : '#fff'} />}
                            </View>
                            <Text style={[styles.defaultToggleText, { color: colors.textPrimary }]}>Set as default address</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
                            <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                                <Text style={[styles.saveText, { color: isDark ? '#1A0B2E' : '#fff' }]}>Save Address</Text>
                                <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#1A0B2E' : '#fff'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    formContainer: { padding: 20, paddingBottom: 40 },
    row: { flexDirection: 'row' },
    fieldContainer: { marginBottom: 18 },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    input: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.textPrimary },
    inputError: { borderColor: '#FF4757' },
    errorText: { fontSize: 12, color: '#FF4757', marginTop: 4 },
    defaultToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 4 },
    checkboxBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
    defaultToggleText: { fontSize: 15, fontWeight: '500' },
    saveButton: { borderRadius: 14, overflow: 'hidden' },
    saveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    saveText: { fontSize: 16, fontWeight: 'bold' },
});

export default AddAddressScreen;