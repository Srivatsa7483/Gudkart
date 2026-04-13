import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Animated,
    TextInput,
    Modal,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import productService from '../../services/api/productService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

// ─── Color name → hex (same map as ProductDetailScreen) ──────────────────
const COLOR_HEX_MAP = {
    black: '#1a1a1a', white: '#f5f5f5', red: '#e53935', blue: '#1e88e5',
    navy: '#1a237e', green: '#43a047', olive: '#827717', yellow: '#fdd835',
    orange: '#fb8c00', pink: '#e91e63', purple: '#8e24aa', violet: '#7b1fa2',
    brown: '#6d4c41', beige: '#d7ccc8', grey: '#9e9e9e', gray: '#9e9e9e',
    silver: '#bdbdbd', gold: '#ffd700', cream: '#fff8e1', maroon: '#880e4f',
    teal: '#00897b', cyan: '#00acc1', indigo: '#3949ab', coral: '#ff7043',
    lavender: '#ce93d8', mint: '#a5d6a7', peach: '#ffccbc', khaki: '#c5b358',
    charcoal: '#37474f', offwhite: '#fafafa', multicolor: '#888888',
};
const colorNameToHex = (name = '') =>
    COLOR_HEX_MAP[name.toLowerCase().replace(/\s+/g, '')] || '#888888';

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

// ─── Skeleton Loader ───────────────────────────────────────────────────────
const SkeletonCard = ({ colors }) => {
    const pulse = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.productCard, { backgroundColor: colors.card, opacity: pulse }]}>
            <View style={[styles.imageContainer, { backgroundColor: colors.border }]} />
            <View style={styles.infoArea}>
                <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.border }]} />
                <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.border, marginTop: 6 }]} />
                <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border, marginTop: 6 }]} />
            </View>
        </Animated.View>
    );
};

// ─── Product Card ──────────────────────────────────────────────────────────
const ProductCard = React.memo(({ item, colors, gradients, cartCount, inWishlist, onPress, onAddToCart, onUpdateQty, onRemoveFromCart, onToggleWishlist }) => {
    const discountPercent = item.discountPrice
        ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
        : 0;
    const inStock = (item.stock ?? item.inStock) > 0 || item.inStock === true;
    const inCart = cartCount > 0;

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: colors.surface || colors.card }]}
            activeOpacity={0.85}
            onPress={onPress}
        >
            {/* Image */}
            <View style={[styles.imageContainer, { backgroundColor: colors.cardAlt || colors.border + '30' }]}>
                {discountPercent > 0 && inStock && (
                    <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.badgeText}>{discountPercent}% OFF</Text>
                    </View>
                )}
                {!inStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
                {/* Cart count pill */}
                {inCart && (
                    <View style={[styles.cartCountPill, { backgroundColor: colors.accent }]}>
                        <Ionicons name="cart" size={9} color="#fff" />
                        <Text style={styles.cartCountText}>{cartCount}</Text>
                    </View>
                )}
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.noImagePlaceholder}>
                        <Text style={{ fontSize: 40 }}>📦</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.wishlistBtn} onPress={() => onToggleWishlist(item)}>
                    <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={18} color={inWishlist ? "#FF4444" : colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoArea}>
                {item.subCategory ? (
                    <Text style={[styles.categoryText, { color: colors.accent }]} numberOfLines={1}>
                        {item.subCategory}
                    </Text>
                ) : null}

                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title || item.name}
                </Text>

                {/* Colors preview */}
                {item.colors?.length > 0 && (
                    <View style={styles.colorDots}>
                        {item.colors.slice(0, 4).map((c, i) => {
                            const hex = typeof c === 'string' ? colorNameToHex(c) : (c.hex || colorNameToHex(c.name));
                            const key = typeof c === 'string' ? c : (c.id || `color-${i}`);
                            return (
                                <View key={key} style={[styles.colorDot, { backgroundColor: hex }]} />
                            );
                        })}
                        {item.colors.length > 4 && (
                            <Text style={[styles.moreColors, { color: colors.textMuted }]}>
                                +{item.colors.length - 4}
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.textPrimary }]}>
                        {formatPrice(item.discountPrice || item.price)}
                    </Text>
                    {item.discountPrice && (
                        <Text style={[styles.oldPrice, { color: colors.textMuted }]}>
                            {formatPrice(item.price)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Add to Cart / Qty Controls */}
            {inCart && inStock ? (
                <View style={[styles.cardQtyRow, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.cardQtyBtn, { backgroundColor: colors.background }]}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            if (cartCount === 1) onRemoveFromCart(item);
                            else onUpdateQty(item, cartCount - 1);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={cartCount === 1 ? 'trash-outline' : 'remove'}
                            size={14}
                            color={cartCount === 1 ? '#E53935' : colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.cardQtyValue, { color: colors.textPrimary }]}>{cartCount}</Text>
                    <TouchableOpacity
                        style={[styles.cardQtyBtn, { backgroundColor: colors.background }]}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            if (cartCount < 10) onUpdateQty(item, cartCount + 1);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.addToCartBtn, { borderTopColor: colors.border, opacity: inStock ? 1 : 0.4 }]}
                    onPress={(e) => { e.stopPropagation?.(); onAddToCart(item); }}
                    disabled={!inStock}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={inStock ? (gradients?.accentButton || gradients?.button || ['#FFD700', '#FFA000']) : ['#9E9E9E', '#757575']}
                        style={styles.addToCartGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="cart-outline" size={13} color="#0D0B1E" />
                        <Text style={styles.addToCartText}>
                            {inStock ? 'Add to Cart' : 'Unavailable'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
});

// ─── Main Screen ───────────────────────────────────────────────────────────
const ProductListScreen = ({ navigation, route }) => {
    const { title = 'All Products', query = '', category = '' } = route.params || {};
    const { colors, gradients } = useTheme();
    const { isLoggedIn } = useAuth();
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    // ─── Cart count map (product id → total qty in cart) ─────────────────
    const cartCountMap = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            acc[item.id] = (acc[item.id] || 0) + (item.quantity || 1);
            return acc;
        }, {});
    }, [cartItems]);

    const totalCartItems = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);

    // Data state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search is purely client-side (filter over fetched results)
    const [searchQuery, setSearchQuery] = useState(query);

    // Sort state
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortBy, setSortBy] = useState('Newest');

    // ─── Fetch ──────────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (category) params.category = category;

            const result = await productService.getAllProducts(params);
            setProducts(result.products || []);
        } catch (err) {
            console.error('[ProductListScreen] fetch error:', err.message);
            setError('Could not load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // ─── Derived: filter + sort ──────────────────────────────────────────────
    const filteredProducts = React.useMemo(() => {
        let list = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.title || p.name || '').toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.subCategory || '').toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case 'Price: Low to High':
                list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                break;
            case 'Price: High to Low':
                list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                break;
            case 'In Stock First':
                list.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
                break;
            case 'Newest':
            default:
                list.sort(
                    (a, b) =>
                        (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0)
                );
        }

        return list;
    }, [products, searchQuery, sortBy]);

    // ─── Cart handlers ────────────────────────────────────────────────────
    const handleAddToCart = useCallback((item) => {
        if (!isLoggedIn) { navigation.navigate('Auth', { screen: 'Login' }); return; }
        const inStock = (item.stock ?? 0) > 0 || item.inStock === true;
        if (!inStock) return;
        addToCart(item, 1);
    }, [isLoggedIn, navigation, addToCart]);

    const handleUpdateQty = useCallback((item, newQty) => {
        if (!isLoggedIn) return;
        updateQuantity(item.id, newQty, item.color || null);
    }, [isLoggedIn, updateQuantity]);

    const handleRemoveFromCart = useCallback((item) => {
        if (!isLoggedIn) return;
        removeFromCart(item.id, item.color || null);
    }, [isLoggedIn, removeFromCart]);

    const handleToggleWishlist = useCallback((item) => {
        if (!isLoggedIn) { navigation.navigate('Auth', { screen: 'Login' }); return; }
        toggleWishlist(item);
    }, [isLoggedIn, navigation, toggleWishlist]);

    // ─── Header animation ─────────────────────────────────────────────────
    const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });
    const headerTranslate = scrollY.interpolate({ inputRange: [0, 60], outputRange: [10, 0], extrapolate: 'clamp' });

    // ─── Render ──────────────────────────────────────────────────────────
    const renderProduct = useCallback(({ item }) => (
        <ProductCard
            item={item}
            colors={colors}
            gradients={gradients}
            cartCount={cartCountMap[item.id] || 0}
            inWishlist={isInWishlist(item.id)}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
        />
    ), [colors, gradients, navigation, cartCountMap, isInWishlist, handleAddToCart, handleUpdateQty, handleRemoveFromCart, handleToggleWishlist]);

    const renderSkeleton = () => (
        <View style={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}>
            {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} colors={colors} />
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Sticky Header BG */}
            <Animated.View style={[
                styles.stickyHeader,
                { backgroundColor: colors.surface || colors.card, opacity: headerOpacity, borderBottomColor: colors.border, paddingTop: insets.top }
            ]} />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Animated.View style={[styles.headerTitleContainer, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
                    </Animated.View>

                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Main', { screen: 'Cart' })}>
                        <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
                        {totalCartItems > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>
                                    {totalCartItems > 9 ? '9+' : totalCartItems}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search & Sort */}
                <View style={styles.searchFilterRow}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface || colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textMuted} />
                        <TextInput
                            placeholder="Search in results..."
                            placeholderTextColor={colors.textMuted}
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.filterBtn, { backgroundColor: colors.accent }]}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Ionicons name="funnel-outline" size={20} color="#0D0B1E" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Content */}
            {loading ? (
                renderSkeleton()
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="cloud-offline-outline" size={64} color={colors.textMuted} />
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: colors.accent }]}
                        onPress={fetchProducts}
                    >
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={8}
                    ListHeaderComponent={
                        <View style={styles.resultsHeader}>
                            <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>{title}</Text>
                            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                                {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No products found{searchQuery ? ` for "${searchQuery}"` : ''}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Sort Modal */}
            <Modal visible={showSortModal} transparent animationType="slide" onRequestClose={() => setShowSortModal(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBlur} onPress={() => setShowSortModal(false)} />
                    <View style={[styles.modalContent, { backgroundColor: colors.surface || colors.card }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Sort By</Text>
                        {['Newest', 'Price: Low to High', 'Price: High to Low', 'In Stock First'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.sortOption}
                                onPress={() => { setSortBy(option); setShowSortModal(false); }}
                            >
                                <Text style={[styles.sortOptionText, { color: sortBy === option ? colors.accent : colors.textPrimary }]}>
                                    {option}
                                </Text>
                                {sortBy === option && <Ionicons name="checkmark" size={20} color={colors.accent} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 10, borderBottomWidth: 1 },
    header: { zIndex: 20, paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60 },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    searchFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, paddingBottom: 12 },
    searchBar: { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1, gap: 8 },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    filterBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    listContent: { paddingHorizontal: 16, paddingTop: 10 },
    resultsHeader: { marginBottom: 20, marginTop: 10 },
    mainTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    resultCount: { fontSize: 14, marginTop: 4, fontWeight: '500' },

    // Product card
    productCard: { width: ITEM_WIDTH, marginBottom: 16, marginRight: 16, borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    imageContainer: { width: '100%', height: ITEM_WIDTH * 1.1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    productImage: { width: '100%', height: '100%' },
    noImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 2 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
    outOfStockText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    wishlistBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
    cartCountPill: { position: 'absolute', top: 42, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, zIndex: 4 },
    cartCountText: { color: '#fff', fontSize: 10, fontWeight: '800' },

    // Add to cart button on card
    addToCartBtn: { borderTopWidth: 1 },
    addToCartGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
    addToCartText: { fontSize: 11, fontWeight: '800', color: '#0D0B1E' },

    // Inline qty controls on card
    cardQtyRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingVertical: 6, paddingHorizontal: 8 },
    cardQtyBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardQtyValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '800' },

    infoArea: { padding: 12 },
    categoryText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    productName: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 6 },
    colorDots: { flexDirection: 'row', gap: 4, marginBottom: 6, alignItems: 'center' },
    colorDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)' },
    moreColors: { fontSize: 10, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    price: { fontSize: 15, fontWeight: '800' },
    oldPrice: { fontSize: 12, textDecorationLine: 'line-through' },

    // Skeleton
    skeletonLine: { height: 12, borderRadius: 6 },

    // Error
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    errorText: { fontSize: 15, textAlign: 'center', marginTop: 16, marginBottom: 24 },
    retryBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
    retryBtnText: { color: '#0D0B1E', fontWeight: '800', fontSize: 15 },

    // Empty
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyText: { fontSize: 15, textAlign: 'center', marginTop: 20 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBlur: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
    sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
    sortOptionText: { fontSize: 16, fontWeight: '600' },

    // Cart badge
    cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FFD700', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1A0B2E' },
    cartBadgeText: { color: '#1A0B2E', fontSize: 10, fontWeight: '900' },
});

export default ProductListScreen;