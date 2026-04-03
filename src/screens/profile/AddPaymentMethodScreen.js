import React, { useState, useRef } from 'react';
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
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const AddPaymentMethodScreen = ({ navigation }) => {
    const { colors, isDark, gradients } = useTheme();
    
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);

    // Animation for card flip (mock effect for now)
    const flipAnim = useRef(new Animated.Value(0)).current;

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/.{1,4}/g);
        return match ? match.join(' ') : cleaned;
    };

    const formatExpiry = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const getCardType = (number) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        return 'Card';
    };

    const handleBack = () => navigation.goBack();

    const handleSave = () => {
        // Logic to save payment
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity 
                    onPress={handleBack}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add Card</Text>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Real-time Card Preview */}
                    <View style={styles.previewContainer}>
                        <LinearGradient
                            colors={getCardType(cardNumber) === 'Visa' ? ['#1A2E4A', '#0D1B2E'] : ['#2D1B69', '#1A0B3E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardPreview}
                        >
                            <View style={styles.cardPreviewHeader}>
                                <Text style={styles.previewBrand}>{getCardType(cardNumber)}</Text>
                                <Ionicons name="card" size={28} color="#FFF" />
                            </View>

                            <Text style={styles.previewNumber}>
                                {cardNumber || '**** **** **** ****'}
                            </Text>

                            <View style={styles.cardPreviewFooter}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.previewLabel}>CARD HOLDER</Text>
                                    <Text style={styles.previewValue}>{cardHolder || 'FULL NAME'}</Text>
                                </View>
                                <View>
                                    <Text style={styles.previewLabel}>EXPIRES</Text>
                                    <Text style={styles.previewValue}>{expiry || 'MM/YY'}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Input Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CARD HOLDER NAME</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                                placeholder="e.g. Rahul Srivastava"
                                placeholderTextColor={colors.textMuted}
                                value={cardHolder}
                                onChangeText={setCardHolder}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CARD NUMBER</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="number-pad"
                                maxLength={19}
                                value={cardNumber}
                                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EXPIRY DATE</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                    value={expiry}
                                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                                />
                            </View>
                            <View style={{ width: 20 }} />
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CVV</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="***"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                    secureTextEntry
                                    value={cvv}
                                    onChangeText={setCvv}
                                />
                            </View>
                        </View>

                        <View style={styles.secureNote}>
                            <Ionicons name="lock-closed" size={14} color={colors.success} />
                            <Text style={[styles.secureText, { color: colors.success }]}>
                                Your card details are encrypted and securely stored.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.primaryBtn}
                    onPress={handleSave}
                >
                    <LinearGradient
                        colors={gradients.button}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>Save & Add Card</Text>
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
        borderBottomWidth: 1,
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
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 20,
    },
    previewContainer: {
        marginBottom: 32,
    },
    cardPreview: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 15,
    },
    cardPreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewBrand: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    previewNumber: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: 2.5,
    },
    cardPreviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    previewLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
    },
    previewValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
    },
    secureNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    secureText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    primaryBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddPaymentMethodScreen;
