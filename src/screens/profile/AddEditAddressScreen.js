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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const AddEditAddressScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const existingAddress = route.params?.address;

    const [form, setForm] = useState({
        name: existingAddress?.name || '',
        phone: existingAddress?.phone || '',
        pincode: existingAddress?.pincode || '',
        state: existingAddress?.state || '',
        city: existingAddress?.city || '',
        houseNo: existingAddress?.houseNo || '',
        area: existingAddress?.area || '',
        type: existingAddress?.type || 'Home',
    });

    const [focusedField, setFocusedField] = useState(null);

    const handleSave = () => {
        const { name, phone, pincode, city, houseNo, area } = form;
        if (!name || !phone || !pincode || !city || !houseNo || !area) {
            Alert.alert('Incomplete Form', 'Please fill all mandatory fields.');
            return;
        }

        // Simulating save
        Alert.alert(
            'Success',
            `Address ${existingAddress ? 'updated' : 'added'} successfully!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const renderInput = (label, key, placeholder, keyboardType = 'default') => (
        <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
            <View 
                style={[
                    styles.inputWrapper, 
                    { 
                        backgroundColor: colors.card, 
                        borderColor: focusedField === key ? colors.primary : colors.border 
                    }
                ]}
            >
                <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={form[key]}
                    onChangeText={(val) => setForm({ ...form, [key]: val })}
                    onFocus={() => setFocusedField(key)}
                    onBlur={() => setFocusedField(null)}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {existingAddress ? 'Edit Address' : 'New Address'}
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
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Details</Text>
                    {renderInput('Full Name', 'name', 'Enter your full name')}
                    {renderInput('Phone Number', 'phone', 'Enter 10-digit phone number', 'phone-pad')}

                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>
                        Shipping Address
                    </Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            {renderInput('Pin Code', 'pincode', '110001', 'number-pad')}
                        </View>
                        <View style={{ flex: 1 }}>
                            {renderInput('State', 'state', 'State name')}
                        </View>
                    </View>
                    {renderInput('City', 'city', 'City name')}
                    {renderInput('House No. / Building Name', 'houseNo', 'Apt 42, Green Valley')}
                    {renderInput('Area / Street / Colony', 'area', 'Sector 5, Near Main Market')}

                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>
                        Address Type
                    </Text>
                    <View style={styles.typeContainer}>
                        {['Home', 'Work', 'Other'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.typeChip,
                                    { 
                                        backgroundColor: form.type === t ? colors.primary : colors.card,
                                        borderColor: form.type === t ? colors.primary : colors.border
                                    }
                                ]}
                                onPress={() => setForm({ ...form, type: t })}
                            >
                                <Ionicons 
                                    name={t === 'Home' ? 'home' : t === 'Work' ? 'briefcase' : 'location'} 
                                    size={18} 
                                    color={form.type === t ? '#FFF' : colors.textSecondary} 
                                />
                                <Text style={[styles.typeChipText, { color: form.type === t ? '#FFF' : colors.textSecondary }]}>
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.saveBtn}
                    onPress={handleSave}
                >
                    <LinearGradient
                        colors={gradients.button}
                        style={styles.saveBtnGradient}
                    >
                        <Text style={styles.saveBtnText}>Save Address</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    formContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        height: 54,
        justifyContent: 'center',
    },
    input: {
        fontSize: 15,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeChip: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    typeChipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
    },
    saveBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    saveBtnGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddEditAddressScreen;
