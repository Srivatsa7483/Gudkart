import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StatusBar, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const AddPaymentMethodScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    const handleSave = () => {
        if (!cardNumber || !expiry || !cvv || !name) {
            Alert.alert('Required', 'Please fill in all card details.');
            return;
        }
        Alert.alert('Success', 'Card added successfully (Demo Mode)');
        navigation.goBack();
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType, maxLength }) => (
        <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity 
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add New Card</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    {/* Visual Card Preview */}
                    <LinearGradient
                        colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#818CF8']}
                        style={styles.cardPreview}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardTop}>
                            <Ionicons name="card" size={32} color="#fff" />
                            <Text style={styles.cardBrand}>PREMIUM</Text>
                        </View>
                        <Text style={styles.previewNumber}>
                            {cardNumber ? cardNumber.replace(/\d{4}(?=.)/g, '$& ') : '•••• •••• •••• ••••'}
                        </Text>
                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.cardLabel}>HOLDER NAME</Text>
                                <Text style={styles.cardInfoText}>{name || 'YOUR NAME'}</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardInfoText}>{expiry || 'MM/YY'}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.form}>
                        <InputField 
                            label="Cardholder Name" 
                            value={name} 
                            onChangeText={setName} 
                            placeholder="John Doe" 
                        />
                        
                        <InputField 
                            label="Card Number" 
                            value={cardNumber} 
                            onChangeText={setCardNumber} 
                            placeholder="1234 5678 9101 1121" 
                            keyboardType="numeric"
                            maxLength={16}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <InputField 
                                    label="Expiry Date" 
                                    value={expiry} 
                                    onChangeText={setExpiry} 
                                    placeholder="MM/YY" 
                                    maxLength={5}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <InputField 
                                    label="CVV" 
                                    value={cvv} 
                                    onChangeText={setCvv} 
                                    placeholder="123" 
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                            </View>
                        </View>

                        <Text style={[styles.hint, { color: colors.textMuted }]}>
                            Safe and secure payment. We don't store your CVV.
                        </Text>

                        <TouchableOpacity 
                            style={styles.saveBtn}
                            activeOpacity={0.9}
                            onPress={handleSave}
                        >
                            <LinearGradient
                                colors={gradients.button || [colors.primary, colors.accent]}
                                style={styles.saveGradient}
                            >
                                <Text style={styles.saveBtnText}>Save Payment Method</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20 },
    cardPreview: {
        height: 200,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        marginBottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardBrand: { color: '#fff', fontSize: 14, fontWeight: '800', opacity: 0.8 },
    previewNumber: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 2 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLabel: { color: '#fff', fontSize: 10, opacity: 0.6, marginBottom: 4 },
    cardInfoText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    form: { gap: 16 },
    inputContainer: { gap: 8 },
    label: { fontSize: 13, fontWeight: '600' },
    input: {
        height: 52, borderRadius: 12, borderWidth: 1.5,
        paddingHorizontal: 16, fontSize: 15, fontWeight: '500',
    },
    row: { flexDirection: 'row' },
    hint: { fontSize: 12, textAlign: 'center', marginTop: 10 },
    saveBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
    saveGradient: { paddingVertical: 18, alignItems: 'center' },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});

export default AddPaymentMethodScreen;
