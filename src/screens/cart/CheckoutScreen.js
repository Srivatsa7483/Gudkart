import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const CheckoutScreen = ({ navigation, route }) => {
    const { colors, gradients, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const { cartTotal = 15797, cartItems = 3 } = route.params || {};

    const [selectedAddress, setSelectedAddress] = useState('1');
    const [selectedPayment, setSelectedPayment] = useState('cod');

    // Mock addresses - Replace with your actual address state
    const addresses = [
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
    ];

    // Payment methods
    const paymentMethods = [
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: 'cash-outline',
            subtitle: 'Pay when you receive',
        },
        {
            id: 'upi',
            name: 'UPI',
            icon: 'phone-portrait-outline',
            subtitle: 'PhonePe, Google Pay, Paytm',
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: 'card-outline',
            subtitle: 'Visa, Mastercard, Rupay',
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            icon: 'business-outline',
            subtitle: 'All major banks',
        },
    ];

    const deliveryFee = cartTotal > 5000 ? 0 : 49;
    const total = cartTotal + deliveryFee;

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
            'Order Confirmation',
            'Are you sure you want to place this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        // Mock order placement
                        Alert.alert(
                            'Order Placed! 🎉',
                            `Your order has been placed successfully.\n\nOrder ID: #ORD${Date.now()}`,
                            [
                                {
                                    text: 'View Orders',
                                    onPress: () => navigation.navigate('Orders'),
                                },
                                {
                                    text: 'Continue Shopping',
                                    onPress: () => navigation.navigate('Main', { screen: 'Home' }),
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const AddressCard = ({ address }) => {
        const isSelected = selectedAddress === address.id;

        return (
            <TouchableOpacity
                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                onPress={() => setSelectedAddress(address.id)}
            >
                <View style={styles.addressHeader}>
                    <View style={styles.radioOuter}>
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

                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="pencil-outline" size={18} color={colors.accent} />
                    </TouchableOpacity>
                </View>

                <View style={styles.addressBody}>
                    <Text style={styles.addressText}>
                        {address.address}, {address.landmark}
                    </Text>
                    <Text style={styles.addressText}>
                        {address.city}, {address.state} - {address.pincode}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const PaymentMethodCard = ({ method }) => {
        const isSelected = selectedPayment === method.id;

        return (
            <TouchableOpacity
                style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                onPress={() => setSelectedPayment(method.id)}
            >
                <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>

                <View style={styles.paymentIcon}>
                    <Ionicons name={method.icon} size={24} color={colors.accent} />
                </View>

                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                </View>

                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]} style={styles.gradient}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Delivery Address Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="location" size={24} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Delivery Address</Text>
                            </View>
                            <TouchableOpacity style={styles.addButton}>
                                <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                                <Text style={styles.addButtonText}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        {addresses.map(address => (
                            <AddressCard key={address.id} address={address} />
                        ))}
                    </View>

                    {/* Payment Method Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="wallet" size={24} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Payment Method</Text>
                            </View>
                        </View>

                        {paymentMethods.map(method => (
                            <PaymentMethodCard key={method.id} method={method} />
                        ))}
                    </View>

                    {/* Order Summary */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="receipt" size={24} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Order Summary</Text>
                            </View>
                        </View>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items ({cartItems}):</Text>
                                <Text style={styles.summaryValue}>₹{cartTotal.toLocaleString()}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                                <Text style={[
                                    styles.summaryValue,
                                    deliveryFee === 0 && styles.freeDelivery
                                ]}>
                                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total Amount:</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>

                            {deliveryFee === 0 && (
                                <View style={styles.savingsInfo}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                    <Text style={styles.savingsText}>
                                        You saved ₹49 on delivery
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Spacing for bottom button */}
                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <LinearGradient
                        colors={isDark ? ['#2E1A47', '#1A0B2E'] : [colors.surface, colors.background]}
                        style={styles.bottomGradient}
                    >
                        <View style={styles.bottomContent}>
                            <View>
                                <Text style={styles.bottomLabel}>Total Amount</Text>
                                <Text style={styles.bottomTotal}>₹{total.toLocaleString()}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.placeOrderButton}
                                onPress={handlePlaceOrder}
                            >
                                <LinearGradient
                                    colors={gradients.button}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.placeOrderGradient}
                                >
                                    <Text style={styles.placeOrderText}>Place Order</Text>
                                    <Ionicons name="checkmark-circle" size={20} color={isDark ? '#1A0B2E' : '#fff'} />
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
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginLeft: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 14,
        color: colors.accent,
        marginLeft: 4,
        fontWeight: '600',
    },

    // Address Card
    addressCard: {
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
    },
    addressCardSelected: {
        borderColor: colors.accent,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.accent,
    },
    addressInfo: {
        flex: 1,
    },
    addressNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: colors.accent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: isDark ? '#1A0B2E' : '#fff',
    },
    addressPhone: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    editButton: {
        padding: 4,
    },
    addressBody: {
        paddingLeft: 36,
    },
    addressText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Payment Card
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
    },
    paymentCardSelected: {
        borderColor: colors.accent,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.cardAlt,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    paymentSubtitle: {
        fontSize: 13,
        color: colors.textMuted,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    freeDelivery: {
        color: colors.success,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardAlt,
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.accent,
    },
    savingsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 217, 126, 0.1)',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    savingsText: {
        fontSize: 13,
        color: colors.success,
        marginLeft: 6,
        fontWeight: '600',
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomGradient: {
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderColor: colors.border,
    },
    bottomContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    bottomTotal: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.accent,
    },
    placeOrderButton: {
        borderRadius: 12,
        overflow: 'hidden',
        flex: 1,
        marginLeft: 16,
    },
    placeOrderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDark ? '#1A0B2E' : '#fff',
        marginRight: 8,
    },
});

export default CheckoutScreen;