import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Platform, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const PaymentMethodsScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const PaymentItem = ({ icon, brand, last4, type, isDefault }) => (
        <TouchableOpacity 
            style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: isDefault ? colors.accent : colors.border }]}
            activeOpacity={0.8}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name={icon} size={24} color={colors.accent} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.brandText, { color: colors.textPrimary }]}>{brand} •••• {last4}</Text>
                <Text style={[styles.typeText, { color: colors.textMuted }]}>{type}</Text>
            </View>
            {isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.defaultText, { color: '#000' }]}>DEFAULT</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
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
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SAVED CARDS</Text>
                
                <PaymentItem 
                    icon="card-outline" 
                    brand="Visa" 
                    last4="4242" 
                    type="Credit Card" 
                    isDefault 
                />
                
                <PaymentItem 
                    icon="card-outline" 
                    brand="Mastercard" 
                    last4="8821" 
                    type="Debit Card" 
                />

                <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 24 }]}>UPI & WALLETS</Text>
                
                <TouchableOpacity 
                    style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#4ADE8020' }]}>
                        <Ionicons name="phone-portrait-outline" size={24} color="#4ADE80" />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.brandText, { color: colors.textPrimary }]}>vinit@okaxis</Text>
                        <Text style={[styles.typeText, { color: colors.textMuted }]}>Google Pay / UPI</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Add Button */}
                <TouchableOpacity 
                    style={styles.addBtn}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('AddPaymentMethod')}
                >
                    <LinearGradient
                        colors={gradients.button || [colors.primary, colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addGradient}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#000" />
                        <Text style={styles.addBtnText}>Add New Payment Method</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.secureBadge}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                    <Text style={[styles.secureText, { color: colors.textMuted }]}>
                        Your payment details are encrypted and secure.
                    </Text>
                </View>

            </ScrollView>
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
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 16 },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
        marginBottom: 12,
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    cardInfo: { flex: 1 },
    brandText: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    typeText: { fontSize: 12, fontWeight: '500' },
    defaultBadge: {
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6, marginRight: 10,
    },
    defaultText: { fontSize: 10, fontWeight: '800' },
    addBtn: { marginTop: 30, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    addGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, gap: 10,
    },
    addBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
    secureBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: 40, gap: 8, paddingHorizontal: 20,
    },
    secureText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default PaymentMethodsScreen;
