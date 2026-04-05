import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { useCart } from '../../context/CartContext'; // ✅ To clear cart after order

const CheckoutScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const { clearCart } = useCart();

    // ✅ Receive real data from CartScreen
    const {
        cartTotal = 0,
        cartItems = [],
        itemCount = 0,
        savings = 0,
    } = route.params || {};

    const [selectedAddress, setSelectedAddress] = useState('1');
    const [selectedPayment, setSelectedPayment] = useState('cod');

    // Mock addresses — replace with addresses from API/context
    const [addresses, setAddresses] = useState([
        {
            id: '1',
            name: 'Rahul Kumar',
            phone: '+91 9876543210',
            address: 'Flat 402, Green Valley Apartments',
            landmark: 'Near City Hospital',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
        },
        {
            id: '2',
            name: 'Rahul Kumar',
            phone: '+91 9876543210',
            address: '23, MG Road',
            landmark: 'Opposite Metro Station',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560002',
            isDefault: false,
        },
    ]);

    const paymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline', subtitle: 'Pay when you receive' },
        { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline', subtitle: 'PhonePe, Google Pay, Paytm' },
        { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline', subtitle: 'Visa, Mastercard, Rupay' },
        { id: 'netbanking', name: 'Net Banking', icon: 'business-outline', subtitle: 'All major banks' },
    ];

    const deliveryFee = cartTotal > 5000 ? 0 : 49;
    const total = cartTotal + deliveryFee;

    // ✅ FIXED: Navigate to OrderSuccessScreen after placing order
    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            Alert.alert('Address Required', 'Please select a delivery address');
            return;
        }
        if (!selectedPayment) {
            Alert.alert('Payment Required', 'Please select a payment method');
            return;
        }

        Alert.alert(
            'Confirm Order',
            'Are you sure you want to place this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Place Order',
                    onPress: () => {
                        const orderId = '#ORD' + Date.now().toString().slice(-8);
                        clearCart(); // ✅ Clear cart after order
                        navigation.navigate('OrderSuccess', {
                            orderId,
                            total: total.toLocaleString(),
                        });
                    },
                },
            ]
        );
    };

    // ✅ Add New Address — navigates to AddAddress screen (create that screen next)
    const handleAddAddress = () => {
        navigation.navigate('AddAddress', {
            onAddressAdded: (newAddress) => {
                setAddresses(prev => [...prev, { ...newAddress, id: Date.now().toString() }]);
            },
        });
    };

    const handleEditAddress = (address) => {
        navigation.navigate('AddAddress', {
            addressToEdit: address,
            onAddressAdded: (updatedAddress) => {
                setAddresses(prev => prev.map(a => a.id === updatedAddress.id ? updatedAddress : a));
            },
        });
    };

    // ─── Address Card ─────────────────────────────────────────────────────────
    const AddressCard = ({ address }) => {
        const isSelected = selectedAddress === address.id;
        return (
            <TouchableOpacity
                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                onPress={() => setSelectedAddress(address.id)}
                activeOpacity={0.85}
            >
                <View style={styles.addressHeader}>
                    <View style={[styles.radioOuter, isSelected && { borderColor: colors.accent }]}>
                        {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.addressInfo}>
                        <View style={styles.addressNameRow}>
                            <Text style={styles.addressName}>{address.name}</Text>
                            {address.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.addressPhone}>{address.phone}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditAddress(address)}
                    >
                        <Ionicons name="pencil-outline" size={18} color={colors.accent} />
                    </TouchableOpacity>
                </View>
                <View style={styles.addressBody}>
                    <Text style={styles.addressText}>{address.address}, {address.landmark}</Text>
                    <Text style={styles.addressText}>{address.city}, {address.state} — {address.pincode}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Payment Method Card ──────────────────────────────────────────────────
    const PaymentMethodCard = ({ method }) => {
        const isSelected = selectedPayment === method.id;
        return (
            <TouchableOpacity
                style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                onPress={() => setSelectedPayment(method.id)}
                activeOpacity={0.85}
            >
                <View style={[styles.radioOuter, isSelected && { borderColor: colors.accent }]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.paymentIcon}>
                    <Ionicons name={method.icon} size={24} color={colors.accent} />
                </View>
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color={colors.success || '#00D97E'} />}
            </TouchableOpacity>
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]} style={styles.gradient}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Scrollable Content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

                    {/* ── Section: Delivery Address ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="location" size={22} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Delivery Address</Text>
                            </View>
                            {/* ✅ FIXED: Add New navigates to AddAddress screen */}
                            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                                <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                                <Text style={styles.addButtonText}>Add New</Text>
                            </TouchableOpacity>
                        </View>
                        {addresses.map(addr => <AddressCard key={addr.id} address={addr} />)}
                    </View>

                    {/* ── Section: Payment Method ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="wallet" size={22} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Payment Method</Text>
                            </View>
                        </View>
                        {paymentMethods.map(method => <PaymentMethodCard key={method.id} method={method} />)}
                    </View>

                    {/* ── Section: Order Summary ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="receipt" size={22} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Order Summary</Text>
                            </View>
                        </View>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                                <Text style={styles.summaryValue}>₹{cartTotal.toLocaleString()}</Text>
                            </View>
                            {savings > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: '#00D97E' }]}>Discount</Text>
                                    <Text style={[styles.summaryValue, { color: '#00D97E' }]}>-₹{savings.toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery</Text>
                                {deliveryFee === 0
                                    ? <Text style={styles.freeDelivery}>FREE</Text>
                                    : <Text style={styles.summaryValue}>₹{deliveryFee}</Text>}
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total Payable</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>
                            {savings > 0 && (
                                <View style={styles.savingsInfo}>
                                    <Ionicons name="pricetag-outline" size={16} color="#00D97E" />
                                    <Text style={styles.savingsText}>You save ₹{savings.toLocaleString()} on this order!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                </ScrollView>

                {/* ─── Bottom Bar: Place Order ───────────────────────────────── */}
                <View style={styles.bottomBar}>
                    <LinearGradient
                        colors={isDark ? ['rgba(26,11,46,0.97)', '#1A0B2E'] : ['rgba(255,255,255,0.97)', '#fff']}
                        style={styles.bottomGradient}
                    >
                        <View style={styles.bottomContent}>
                            <View>
                                <Text style={styles.bottomLabel}>Total Payable</Text>
                                <Text style={styles.bottomTotal}>₹{total.toLocaleString()}</Text>
                            </View>
                            {/* ✅ FIXED: Navigates to OrderSuccessScreen */}
                            <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} activeOpacity={0.85}>
                                <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.placeOrderGradient}>
                                    <Text style={styles.placeOrderText}>Place Order</Text>
                                    <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? '#1A0B2E' : '#fff'} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

            </LinearGradient>
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },

    section: { marginBottom: 24 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, marginTop: 20, marginBottom: 12,
    },
    sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginLeft: 8 },
    addButton: { flexDirection: 'row', alignItems: 'center' },
    addButtonText: { fontSize: 14, color: colors.accent, marginLeft: 4, fontWeight: '600' },

    // Address
    addressCard: {
        backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 12,
        borderRadius: 12, padding: 16, borderWidth: 2, borderColor: colors.border,
    },
    addressCardSelected: { borderColor: colors.accent },
    addressHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    radioOuter: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2,
        borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent },
    addressInfo: { flex: 1 },
    addressNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    addressName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginRight: 8 },
    defaultBadge: { backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    defaultText: { fontSize: 11, fontWeight: 'bold', color: isDark ? '#1A0B2E' : '#fff' },
    addressPhone: { fontSize: 14, color: colors.textSecondary },
    editButton: { padding: 4 },
    addressBody: { paddingLeft: 34 },
    addressText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

    // Payment
    paymentCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 12,
        borderRadius: 12, padding: 16, borderWidth: 2, borderColor: colors.border,
    },
    paymentCardSelected: { borderColor: colors.accent },
    paymentIcon: {
        width: 46, height: 46, borderRadius: 23, backgroundColor: colors.cardAlt,
        justifyContent: 'center', alignItems: 'center', marginHorizontal: 12,
    },
    paymentInfo: { flex: 1 },
    paymentName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 3 },
    paymentSubtitle: { fontSize: 13, color: colors.textMuted },

    // Summary
    summaryCard: {
        backgroundColor: colors.surface, marginHorizontal: 16,
        borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 15, color: colors.textSecondary },
    summaryValue: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
    freeDelivery: { color: '#00D97E', fontWeight: 'bold', fontSize: 15 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
    totalLabel: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: colors.accent },
    savingsInfo: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,217,126,0.1)', padding: 10, borderRadius: 8, marginTop: 8,
    },
    savingsText: { fontSize: 13, color: '#00D97E', marginLeft: 6, fontWeight: '600' },

    // Bottom Bar
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    bottomGradient: {
        paddingTop: 16, paddingBottom: 28, paddingHorizontal: 16,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderTopWidth: 1, borderColor: colors.border,
    },
    bottomContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    bottomLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
    bottomTotal: { fontSize: 24, fontWeight: 'bold', color: colors.accent },
    placeOrderButton: { borderRadius: 12, overflow: 'hidden', flex: 1, marginLeft: 16 },
    placeOrderGradient: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', paddingVertical: 16, gap: 8,
    },
    placeOrderText: { fontSize: 16, fontWeight: 'bold', color: isDark ? '#1A0B2E' : '#fff' },
});

export default CheckoutScreen;