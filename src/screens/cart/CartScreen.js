import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { useCart } from '../../context/CartContext'; // ✅ Connected to CartContext

const CartScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getStyles(colors, isDark, insets), [colors, isDark, insets]);

    // ✅ Use CartContext instead of local mock state
    const { cartItems, updateQuantity: ctxUpdateQty, removeFromCart } = useCart();

    const getKey = (item) => item.id + (item.color || '');

    const [selectedItems, setSelectedItems] = useState(
        cartItems.reduce((acc, item) => ({ ...acc, [getKey(item)]: true }), {})
    );

    // ─── Totals ───────────────────────────────────────────────────────────────
    const subtotal = cartItems.reduce((total, item) =>
        selectedItems[getKey(item)] ? total + item.price * item.quantity : total, 0);

    const savings = cartItems.reduce((total, item) =>
        selectedItems[getKey(item)] ? total + (item.originalPrice - item.price) * item.quantity : total, 0);

    const deliveryFee = subtotal > 5000 ? 0 : 49;
    const total = subtotal + deliveryFee;

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const updateQuantity = (itemId, color, newQty) => {
        if (newQty > 10) { Alert.alert('Limit Reached', 'Maximum 10 items per product'); return; }
        ctxUpdateQty(itemId, newQty, color);
    };

    const removeItem = (itemId, color) => {
        Alert.alert('Remove Item', 'Remove this item from cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: () => {
                    removeFromCart(itemId, color);
                    setSelectedItems(prev => {
                        const updated = { ...prev };
                        delete updated[itemId + (color || '')];
                        return updated;
                    });
                },
            },
        ]);
    };

    const toggleSelectItem = (key) =>
        setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));

    const selectAllItems = () => {
        const allSelected = Object.values(selectedItems).every(v => v);
        setSelectedItems(cartItems.reduce((acc, item) => ({ ...acc, [getKey(item)]: !allSelected }), {}));
    };

    // ✅ FIXED: Navigates to CheckoutScreen with full cart data
    const handleCheckout = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems[getKey(item)]);
        if (selectedCartItems.length === 0) {
            Alert.alert('No Items Selected', 'Please select at least one item to checkout');
            return;
        }
        navigation.navigate('Checkout', {
            cartTotal: subtotal,
            cartItems: selectedCartItems,
            itemCount: selectedCartItems.length,
            savings,
        });
    };

    // ─── CartItem Component ───────────────────────────────────────────────────
    const CartItem = ({ item }) => {
        const key = getKey(item);
        const isSelected = selectedItems[key];
        return (
            <View style={styles.cartItem}>
                <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelectItem(key)}>
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color={isDark ? '#1A0B2E' : '#fff'} />}
                    </View>
                </TouchableOpacity>

                <Image source={{ uri: item.image }} style={styles.productImage} />

                <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    {item.color && (
                        <View style={styles.colorContainer}>
                            <Text style={styles.colorLabel}>Color: </Text>
                            <Text style={styles.colorValue}>{item.color}</Text>
                        </View>
                    )}

                    <View style={styles.sellerContainer}>
                        <Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.sellerText}>{item.seller}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>₹{item.price.toLocaleString()}</Text>
                        <Text style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}% OFF</Text>
                        </View>
                    </View>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.color, item.quantity - 1)}>
                            <Ionicons name="remove" size={18} color={colors.accent} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.color, item.quantity + 1)}>
                            <Ionicons name="add" size={18} color={colors.accent} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id, item.color)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error || '#FF4757'} />
                </TouchableOpacity>
            </View>
        );
    };

    // ─── Empty State ──────────────────────────────────────────────────────────
    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]} style={styles.gradient}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Cart</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="cart-outline" size={80} color={colors.border} />
                        </View>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptySubtitle}>Add items to get started</Text>
                        <TouchableOpacity style={styles.shopNowButton}
                            onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                            <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shopNowGradient}>
                                <Text style={styles.shopNowText}>Shop Now</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    // ─── Main Render ──────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]} style={styles.gradient}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
                    <TouchableOpacity onPress={selectAllItems}>
                        <Text style={[styles.selectAllText, { color: colors.accent }]}>
                            {Object.values(selectedItems).every(v => v) ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Free Delivery Banner */}
                {subtotal < 5000 && (
                    <View style={styles.deliveryInfo}>
                        <Ionicons name="bicycle-outline" size={18} color="#00D9FF" />
                        <Text style={styles.deliveryInfoText}>
                            Add <Text style={{ fontWeight: 'bold', color: '#00D9FF' }}>
                                ₹{(5000 - subtotal).toLocaleString()}
                            </Text> more for FREE delivery
                        </Text>
                    </View>
                )}

                {/* Items List */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 220 }}
                >
                    {cartItems.map(item => <CartItem key={getKey(item)} item={item} />)}
                </ScrollView>

                {/* ─── Bottom Bar ─── */}
                <View style={styles.bottomBar}>
                    <LinearGradient
                        colors={isDark ? ['rgba(26,11,46,0.97)', '#1A0B2E'] : ['rgba(255,255,255,0.97)', '#fff']}
                        style={styles.bottomGradient}
                    >
                        {/* Price Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                            </View>
                            {savings > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.savingsLabel}>You Save</Text>
                                    <Text style={styles.savingsValue}>-₹{savings.toLocaleString()}</Text>
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
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* ✅ Checkout Button */}
                        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.85}>
                            <LinearGradient colors={gradients.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkoutGradient}>
                                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                                <Ionicons name="arrow-forward" size={20} color={isDark ? '#1A0B2E' : '#fff'} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

            </LinearGradient>
        </SafeAreaView>
    );
};

const getStyles = (colors, isDark, insets) => StyleSheet.create({
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
    selectAllText: { fontSize: 14, fontWeight: '600' },

    deliveryInfo: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: isDark ? 'rgba(0,217,255,0.1)' : 'rgba(0,217,255,0.05)',
        marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12,
        borderWidth: 1, borderColor: '#00D9FF',
    },
    deliveryInfoText: { flex: 1, fontSize: 13, color: colors.textSecondary, marginLeft: 8 },

    cartItem: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: colors.surface,
        marginBottom: 12, borderRadius: 16, padding: 12,
        borderWidth: 1, borderColor: colors.border,
    },
    checkbox: { paddingTop: 8, paddingRight: 8 },
    checkboxBox: {
        width: 24, height: 24, borderRadius: 6,
        borderWidth: 2, borderColor: colors.border,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
    productImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: colors.cardAlt },
    productDetails: { flex: 1, marginLeft: 12 },
    productName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
    colorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    colorLabel: { fontSize: 13, color: colors.textMuted },
    colorValue: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    sellerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    sellerText: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    currentPrice: { fontSize: 18, fontWeight: 'bold', color: colors.accent, marginRight: 8 },
    originalPrice: { fontSize: 14, color: colors.textMuted, textDecorationLine: 'line-through', marginRight: 6 },
    discountBadge: { backgroundColor: '#00D97E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    discountText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    quantityButton: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: colors.cardAlt, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    quantityText: {
        fontSize: 16, fontWeight: '600', color: colors.textPrimary,
        marginHorizontal: 16, minWidth: 24, textAlign: 'center',
    },
    removeButton: { padding: 8 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    bottomGradient: {
        paddingTop: 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 16,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderTopWidth: 1, borderColor: colors.border,
    },
    summaryContainer: { marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: colors.textSecondary },
    summaryValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
    savingsLabel: { fontSize: 14, color: '#00D97E' },
    savingsValue: { fontSize: 14, color: '#00D97E', fontWeight: '600' },
    freeDelivery: { color: '#00D97E', fontWeight: 'bold', fontSize: 14 },
    divider: { height: 1, backgroundColor: colors.cardAlt, marginVertical: 8 },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.accent },
    checkoutButton: { borderRadius: 12, overflow: 'hidden' },
    checkoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    checkoutText: { fontSize: 16, fontWeight: 'bold', color: isDark ? '#1A0B2E' : '#fff', marginRight: 8 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    emptyIconContainer: {
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
        marginBottom: 24, borderWidth: 2, borderColor: colors.border,
    },
    emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
    shopNowButton: { borderRadius: 12, overflow: 'hidden', width: '100%' },
    shopNowGradient: { paddingVertical: 16, alignItems: 'center' },
    shopNowText: { fontSize: 16, fontWeight: 'bold', color: isDark ? '#1A0B2E' : '#fff' },
});

export default CartScreen;