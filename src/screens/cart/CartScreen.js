import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,

    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

const CartScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = React.useMemo(() => getStyles(colors, isDark, insets), [colors, isDark, insets]);
    // Mock cart data - Replace with your actual cart state
    const [cartItems, setCartItems] = useState([
        {
            id: '1',
            name: 'Gold Edition Smart Watch',
            price: 8999,
            originalPrice: 14000,
            discount: 36,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            color: 'Gold',
            inStock: true,
            seller: 'TechStore',
        },
        {
            id: '2',
            name: 'Air Max Prestige Shoes',
            price: 4299,
            originalPrice: 7200,
            discount: 40,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            color: 'White',
            inStock: true,
            seller: 'SneakerHub',
        },
        {
            id: '3',
            name: 'Wireless Headphones',
            price: 2499,
            originalPrice: 4999,
            discount: 50,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            color: 'Black',
            inStock: true,
            seller: 'AudioPro',
        },
    ]);

    const [selectedItems, setSelectedItems] = useState(
        cartItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
    );

    // Calculate totals
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.id]) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const calculateSavings = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems[item.id]) {
                return total + ((item.originalPrice - item.price) * item.quantity);
            }
            return total;
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const savings = calculateSavings();
    const deliveryFee = subtotal > 5000 ? 0 : 49;
    const total = subtotal + deliveryFee;

    // Handlers
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > 10) {
            Alert.alert('Limit Reached', 'Maximum 10 items per product');
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (itemId) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                        const newSelected = { ...selectedItems };
                        delete newSelected[itemId];
                        setSelectedItems(newSelected);
                    },
                },
            ]
        );
    };

    const toggleSelectItem = (itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };

    const selectAllItems = () => {
        const allSelected = Object.values(selectedItems).every(val => val);
        const newSelected = cartItems.reduce(
            (acc, item) => ({ ...acc, [item.id]: !allSelected }),
            {}
        );
        setSelectedItems(newSelected);
    };

    const handleCheckout = () => {
        const selectedCount = Object.values(selectedItems).filter(Boolean).length;

        if (selectedCount === 0) {
            Alert.alert('No Items Selected', 'Please select at least one item to checkout');
            return;
        }

        // Navigate to checkout screen
        Alert.alert('Checkout', 'Proceeding to checkout...', [
            { text: 'OK', onPress: () => console.log('Navigate to checkout') }
        ]);
    };

    const CartItem = ({ item }) => {
        const isSelected = selectedItems[item.id];

        return (
            <View style={styles.cartItem}>
                {/* Selection Checkbox */}
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleSelectItem(item.id)}
                >
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color={isDark ? '#1A0B2E' : '#fff'} />}
                    </View>
                </TouchableOpacity>

                {/* Product Image */}
                <Image source={{ uri: item.image }} style={styles.productImage} />

                {/* Product Details */}
                <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.colorContainer}>
                        <Text style={styles.colorLabel}>Color: </Text>
                        <Text style={styles.colorValue}>{item.color}</Text>
                    </View>

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

                    {/* Quantity Controls */}
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                            <Ionicons name="remove" size={18} color={colors.accent} />
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            <Ionicons name="add" size={18} color={colors.accent} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Remove Button */}
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.error || '#FF4757'} />
                </TouchableOpacity>
            </View>
        );
    };

    const EmptyCart = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="cart-outline" size={80} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
                Add items to get started
            </Text>
            <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            >
                <LinearGradient
                    colors={gradients.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shopNowGradient}
                >
                    <Text style={styles.shopNowText}>Shop Now</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    if (cartItems.length === 0) {
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
                        <Text style={styles.headerTitle}>Shopping Cart</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <EmptyCart />
                </LinearGradient>
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Select All */}
                <View style={styles.selectAllContainer}>
                    <TouchableOpacity
                        style={styles.selectAllButton}
                        onPress={selectAllItems}
                    >
                        <View style={[
                            styles.checkboxBox,
                            Object.values(selectedItems).every(val => val) && styles.checkboxChecked
                        ]}>
                            {Object.values(selectedItems).every(val => val) && (
                                <Ionicons name="checkmark" size={16} color={isDark ? '#1A0B2E' : '#fff'} />
                            )}
                        </View>
                        <Text style={styles.selectAllText}>Select All</Text>
                    </TouchableOpacity>

                    <Text style={styles.itemCount}>
                        {Object.values(selectedItems).filter(Boolean).length} items selected
                    </Text>
                </View>

                {/* Cart Items */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {cartItems.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}

                    {/* Delivery Info */}
                    <View style={styles.deliveryInfo}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.info || '#00D9FF'} />
                        <Text style={styles.deliveryInfoText}>
                            {deliveryFee === 0
                                ? '🎉 Yay! Free delivery on this order'
                                : `Add ₹${(5000 - subtotal).toLocaleString()} more for FREE delivery`}
                        </Text>
                    </View>

                    {/* Spacing for bottom bar */}
                    <View style={{ height: 200 }} />
                </ScrollView>

                {/* Bottom Summary Bar */}
                <View style={styles.bottomBar}>
                    <LinearGradient
                        colors={isDark ? ['#2E1A47', '#1A0B2E'] : [colors.surface, colors.background]}
                        style={styles.bottomGradient}
                    >
                        {/* Price Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal:</Text>
                                <Text style={styles.summaryValue}>₹{subtotal.toLocaleString()}</Text>
                            </View>

                            {savings > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.savingsLabel}>You Save:</Text>
                                    <Text style={styles.savingsValue}>-₹{savings.toLocaleString()}</Text>
                                </View>
                            )}

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery:</Text>
                                <Text style={[
                                    styles.summaryValue,
                                    deliveryFee === 0 && styles.freeDelivery
                                ]}>
                                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* Checkout Button */}
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <LinearGradient
                                colors={gradients.button}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.checkoutGradient}
                            >
                                <Text style={styles.checkoutText}>
                                    Proceed to Checkout ({Object.values(selectedItems).filter(Boolean).length})
                                </Text>
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

    // Select All
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    itemCount: {
        color: colors.textMuted,
        fontSize: 14,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Cart Item
    cartItem: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    checkbox: {
        paddingTop: 8,
        paddingRight: 8,
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: colors.cardAlt,
    },
    productDetails: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 6,
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    colorLabel: {
        fontSize: 13,
        color: colors.textMuted,
    },
    colorValue: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sellerText: {
        fontSize: 12,
        color: colors.textMuted,
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    currentPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.accent,
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: colors.textMuted,
        textDecorationLine: 'line-through',
        marginRight: 6,
    },
    discountBadge: {
        backgroundColor: '#00D97E',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.cardAlt,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginHorizontal: 16,
        minWidth: 24,
        textAlign: 'center',
    },
    removeButton: {
        padding: 8,
    },

    // Delivery Info
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(0, 217, 255, 0.1)' : 'rgba(0, 217, 255, 0.05)',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00D9FF',
    },
    deliveryInfoText: {
        flex: 1,
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: 8,
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
    summaryContainer: {
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    savingsLabel: {
        fontSize: 14,
        color: colors.success,
    },
    savingsValue: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '600',
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
    checkoutButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    checkoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    checkoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDark ? '#1A0B2E' : '#fff',
        marginRight: 8,
    },

    // Empty Cart
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: colors.border,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    shopNowButton: {
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
    },
    shopNowGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    shopNowText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDark ? '#1A0B2E' : '#fff',
    },
});

export default CartScreen;