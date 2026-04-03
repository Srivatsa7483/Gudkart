// ─── ProductDetailScreen.js ────────────────────────────────────────────────
// Gudkart — Expo Go compatible
// Features:
//   • Image carousel with dot indicators (FlatList, pagingEnabled)
//   • Exclusive/In Stock badge
//   • Product name, rating stars, review count
//   • Price, original price, discount %
//   • Color selector (gold, silver, black)
//   • Spec highlights chips
//   • Full specs table
//   • Seller card
//   • Reviews list
//   • Sticky bottom bar — Wishlist + Add to Cart
//   • Back button + wishlist in header
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    StatusBar,
    Animated,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { PRODUCT_DETAIL } from '../../data/mockData';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.38;

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 13, color }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons
                key={s}
                name={
                    s <= Math.floor(rating)
                        ? 'star'
                        : s - rating < 1
                            ? 'star-half'
                            : 'star-outline'
                }
                size={size}
                color={color}
            />
        ))}
    </View>
);

// ─── Image Carousel ────────────────────────────────────────────────────────
const ImageCarousel = ({ images, colors }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onScroll = useCallback((e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(idx);
    }, []);

    return (
        <View style={{ height: IMAGE_HEIGHT }}>
            <FlatList
                data={images}
                keyExtractor={(i) => i.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                renderItem={({ item }) => (
                    <LinearGradient
                        colors={item.gradient}
                        style={[styles.imageSlide, { width }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Decorative circles */}
                        <View style={styles.imgCircle1} />
                        <View style={styles.imgCircle2} />
                        <Text style={styles.productHeroEmoji}>{item.emoji}</Text>
                    </LinearGradient>
                )}
            />

            {/* Dot indicators */}
            <View style={styles.dotsRow}>
                {images.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.imgDot,
                            {
                                backgroundColor:
                                    i === activeIndex ? colors.accent : colors.border,
                                width: i === activeIndex ? 20 : 6,
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

// ─── Color Selector ────────────────────────────────────────────────────────
const ColorSelector = ({ colors: productColors, selectedId, onSelect, themeColors }) => (
    <View style={styles.colorRow}>
        {productColors.map((c) => (
            <TouchableOpacity
                key={c.id}
                onPress={() => onSelect(c.id)}
                activeOpacity={0.8}
                style={[
                    styles.colorSwatch,
                    {
                        backgroundColor: c.hex,
                        borderColor:
                            selectedId === c.id ? themeColors.textPrimary : 'transparent',
                        borderWidth: selectedId === c.id ? 2.5 : 2,
                        shadowColor: c.hex,
                    },
                ]}
            />
        ))}
    </View>
);

// ─── Highlight Chip ────────────────────────────────────────────────────────
const HighlightChip = ({ label, colors }) => (
    <View style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.primary + '60' }]}>
        <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
        <Text style={[styles.chipText, { color: colors.textSecondary }]}>{label}</Text>
    </View>
);

// ─── Spec Row ──────────────────────────────────────────────────────────────
const SpecRow = ({ label, value, colors, isLast }) => (
    <View
        style={[
            styles.specRow,
            { borderBottomColor: colors.divider, borderBottomWidth: isLast ? 0 : 1 },
        ]}
    >
        <Text style={[styles.specLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.specValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
);

// ─── Review Card ───────────────────────────────────────────────────────────
const ReviewCard = ({ review, colors }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.reviewHeader}>
            <View style={[styles.reviewAvatar, { backgroundColor: colors.primary + '30' }]}>
                <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>
                    {review.avatar}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.reviewUser, { color: colors.textPrimary }]}>{review.user}</Text>
                <View style={styles.reviewMeta}>
                    <StarRating rating={review.rating} size={11} color="#FFD700" />
                    <Text style={[styles.reviewDate, { color: colors.textMuted }]}>{review.date}</Text>
                </View>
            </View>
        </View>
        <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
            {review.comment}
        </Text>
    </View>
);

// ─── Section Title ─────────────────────────────────────────────────────────
const SectionTitle = ({ title, colors }) => (
    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
);

// ─── Main Screen ───────────────────────────────────────────────────────────
const ProductDetailScreen = ({ navigation, route }) => {
    // Accept product from route params, fallback to mock data
    const product = route?.params?.product ?? PRODUCT_DETAIL;
    const { colors, gradients, isDark } = useTheme();
    const { isAuthenticated } = useAuth();

    const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const wishScale = useRef(new Animated.Value(1)).current;

    const handleWishlist = () => {
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }
        Animated.sequence([
            Animated.spring(wishScale, { toValue: 1.35, useNativeDriver: true }),
            Animated.spring(wishScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
        setIsWishlisted((w) => !w);
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }
        Alert.alert(
            '✅ Added to Cart',
            `${product.name} (×${quantity}) added to your Gudkart bag!`,
            [{ text: 'OK' }],
        );
        // TODO: dispatch cartSlice action
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }
        // TODO: navigate to Checkout
        Alert.alert('Buy Now', 'Checkout coming soon!');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            {/* ── Floating Header ─────────────────────────────────────────────── */}
            <SafeAreaView edges={['top']} style={styles.floatingHeader}>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: colors.card + 'CC', borderColor: colors.border }]}
                    onPress={() => navigation?.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.card + 'CC', borderColor: colors.border }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="share-social-outline" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <Animated.View style={{ transform: [{ scale: wishScale }] }}>
                        <TouchableOpacity
                            style={[
                                styles.headerBtn,
                                {
                                    backgroundColor: isWishlisted
                                        ? '#F472B6' + '30'
                                        : colors.card + 'CC',
                                    borderColor: isWishlisted ? '#F472B6' : colors.border,
                                },
                            ]}
                            onPress={handleWishlist}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isWishlisted ? 'heart' : 'heart-outline'}
                                size={20}
                                color={isWishlisted ? '#F472B6' : colors.textPrimary}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>

            {/* ── Scrollable Body ─────────────────────────────────────────────── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
            >
                {/* Image Carousel */}
                <ImageCarousel images={product.images} colors={colors} />

                {/* ── Product Info Card ─────────────────────────────────────────── */}
                <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>

                    {/* Status Badge */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.exclusiveBadge, { backgroundColor: product.badgeColor + '20', borderColor: product.badgeColor + '60' }]}>
                            <Ionicons name="star" size={10} color={product.badgeColor} />
                            <Text style={[styles.exclusiveBadgeText, { color: product.badgeColor }]}>
                                {product.badge}
                            </Text>
                        </View>
                        <View style={[styles.stockBadge, { backgroundColor: colors.success + '20' }]}>
                            <View style={[styles.stockDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.stockText, { color: colors.success }]}>
                                In Stock {product.stockLabel}
                            </Text>
                        </View>
                    </View>

                    {/* Product Name */}
                    <Text style={[styles.productName, { color: colors.textPrimary }]}>
                        {product.name}
                    </Text>
                    <Text style={[styles.productSubtitle, { color: colors.textMuted }]}>
                        {product.subtitle}
                    </Text>

                    {/* Rating Row */}
                    <View style={styles.ratingRow}>
                        <StarRating rating={product.rating} size={14} color={colors.accent} />
                        <Text style={[styles.ratingValue, { color: colors.accent }]}>
                            {product.rating}
                        </Text>
                        <Text style={[styles.ratingCount, { color: colors.textMuted }]}>
                            ({product.reviews.toLocaleString('en-IN')} reviews)
                        </Text>
                    </View>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: colors.accent }]}>
                            {formatPrice(product.price)}
                        </Text>
                        <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                            {formatPrice(product.originalPrice)}
                        </Text>
                        <View style={[styles.discountTag, { backgroundColor: colors.success + '20', borderColor: colors.success + '40' }]}>
                            <Text style={[styles.discountText, { color: colors.success }]}>
                                {product.discount}% OFF
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.savingsText, { color: colors.textMuted }]}>
                        You save {formatPrice(product.originalPrice - product.price)} on this order
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    {/* Color Selector */}
                    <SectionTitle title="Color" colors={colors} />
                    <ColorSelector
                        colors={product.colors}
                        selectedId={selectedColor}
                        onSelect={setSelectedColor}
                        themeColors={colors}
                    />

                    {/* Highlights */}
                    <View style={styles.highlightsRow}>
                        {product.highlights.map((h, i) => (
                            <HighlightChip key={i} label={h} colors={colors} />
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    {/* Specifications */}
                    <SectionTitle title="Specifications" colors={colors} />
                    <View style={[styles.specsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {product.specs.map((s, i) => (
                            <SpecRow
                                key={i}
                                label={s.label}
                                value={s.value}
                                colors={colors}
                                isLast={i === product.specs.length - 1}
                            />
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    {/* Seller Card */}
                    <SectionTitle title="Sold by" colors={colors} />
                    <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.sellerAvatar, { backgroundColor: colors.primary + '25' }]}>
                            <Ionicons name="storefront-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.sellerNameRow}>
                                <Text style={[styles.sellerName, { color: colors.textPrimary }]}>
                                    {product.seller.name}
                                </Text>
                                {product.seller.verified && (
                                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                                )}
                            </View>
                            <View style={styles.sellerMeta}>
                                <StarRating rating={product.seller.rating} size={11} color={colors.accent} />
                                <Text style={[styles.sellerStats, { color: colors.textMuted }]}>
                                    {product.seller.rating}  •  {product.seller.sales}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.visitBtn, { borderColor: colors.primary + '60' }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.visitBtnText, { color: colors.primary }]}>Visit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    {/* Reviews */}
                    <View style={styles.reviewsHeader}>
                        <SectionTitle title="Reviews" colors={colors} />
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    {product.reviews.map((r) => (
                        <ReviewCard key={r.id} review={r} colors={colors} />
                    ))}

                    {/* Bottom spacing for sticky bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* ── Sticky Bottom Action Bar ─────────────────────────────────────── */}
            <SafeAreaView
                edges={['bottom']}
                style={[styles.stickyBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
            >
                {/* Quantity */}
                <View style={[styles.qtyControl, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="remove" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => q + 1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={16} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Wishlist Button */}
                <TouchableOpacity
                    style={[
                        styles.wishlistBtn,
                        {
                            backgroundColor: colors.card,
                            borderColor: isWishlisted ? '#F472B6' : colors.border,
                        },
                    ]}
                    onPress={handleWishlist}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isWishlisted ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isWishlisted ? '#F472B6' : colors.textSecondary}
                    />
                    <Text
                        style={[
                            styles.wishlistBtnText,
                            { color: isWishlisted ? '#F472B6' : colors.textSecondary },
                        ]}
                    >
                        {isWishlisted ? 'Saved' : 'Wishlist'}
                    </Text>
                </TouchableOpacity>

                {/* Add to Cart Button */}
                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={gradients.accentButton}
                        style={styles.cartBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="bag-add-outline" size={18} color="#0D0B1E" />
                        <Text style={styles.cartBtnText}>Add to Cart</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Floating header
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 0,
        paddingBottom: 8,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },

    scrollContent: { paddingBottom: 0 },

    // Image
    imageSlide: {
        height: IMAGE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    imgCircle1: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        right: -60,
        bottom: -40,
    },
    imgCircle2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        left: -30,
        top: -20,
    },
    productHeroEmoji: {
        fontSize: 110,
    },
    dotsRow: {
        position: 'absolute',
        bottom: 14,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    imgDot: {
        height: 6,
        borderRadius: 3,
    },

    // Info card
    infoCard: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 0,
        minHeight: 500,
    },

    // Badges
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    exclusiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    exclusiveBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    stockDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Name
    productName: {
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 28,
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    productSubtitle: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 12,
    },

    // Rating
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 14,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    ratingCount: {
        fontSize: 12,
    },

    // Price
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    price: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    originalPrice: {
        fontSize: 16,
        textDecorationLine: 'line-through',
    },
    discountTag: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    discountText: {
        fontSize: 12,
        fontWeight: '700',
    },
    savingsText: {
        fontSize: 12,
        marginBottom: 4,
    },

    // Divider
    divider: {
        height: 1,
        marginVertical: 18,
    },

    // Section title
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },

    // Color selector
    colorRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
    },

    // Highlights
    highlightsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Specs
    specsCard: {
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    specLabel: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    specValue: {
        fontSize: 13,
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },

    // Seller
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
    },
    sellerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    sellerName: {
        fontSize: 14,
        fontWeight: '700',
    },
    sellerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sellerStats: {
        fontSize: 11,
    },
    visitBtn: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    visitBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Reviews
    reviewsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
    },
    reviewCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewAvatarText: {
        fontSize: 15,
        fontWeight: '700',
    },
    reviewUser: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewDate: {
        fontSize: 11,
    },
    reviewComment: {
        fontSize: 13,
        lineHeight: 19,
    },

    // Sticky bar
    stickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 0 : 10,
        gap: 10,
        borderTopWidth: 1,
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    qtyBtn: {
        width: 34,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyValue: {
        fontSize: 14,
        fontWeight: '700',
        minWidth: 24,
        textAlign: 'center',
    },
    wishlistBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 44,
    },
    wishlistBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cartBtn: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        height: 44,
    },
    cartBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
    },
    cartBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0D0B1E',
        letterSpacing: 0.2,
    },
});

export default ProductDetailScreen;