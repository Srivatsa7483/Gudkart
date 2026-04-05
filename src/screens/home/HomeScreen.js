// ─── HomeScreen.js ─────────────────────────────────────────────────────────
// Gudkart — Expo Go compatible

import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
    CATEGORIES,
    FLASH_DEALS,
    CURATED_PRODUCTS,
    TRENDING_PRODUCTS,
    PRODUCT_DETAIL,
} from '../../data/mockData';
import NotificationBadge from '../../components/NotificationBadge';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const DEAL_WIDTH = width - 32;

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// ─── Star Rating ───────────────────────────────────────────────────────────
const StarRating = ({ rating, color }) => (
    <View style={{ flexDirection: 'row', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons
                key={s}
                name={s <= Math.floor(rating) ? 'star' : s - rating < 1 ? 'star-half' : 'star-outline'}
                size={10}
                color={color}
            />
        ))}
    </View>
);

// ─── Category Item ─────────────────────────────────────────────────────────
const CategoryItem = ({ item, colors, isSelected, onPress }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.75}>
        <View
            style={[
                styles.categoryCircle,
                {
                    backgroundColor: isSelected ? item.color : colors.card,
                    borderColor: isSelected ? item.color : colors.border,
                    shadowColor: item.color,
                },
            ]}
        >
            <Ionicons name={item.icon} size={22} color={isSelected ? '#fff' : item.color} />
        </View>
        <Text style={[styles.categoryLabel, { color: isSelected ? colors.textPrimary : colors.textMuted }]}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

// ─── Flash Deal Card ───────────────────────────────────────────────────────
const FlashDealCard = ({ item }) => (
    <LinearGradient colors={item.gradientColors} style={styles.dealCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.dealContent}>
            <View style={[styles.dealBadge, { backgroundColor: item.accentColor + '25', borderColor: item.accentColor + '60' }]}>
                <Text style={[styles.dealBadgeText, { color: item.accentColor }]}>{item.badge}</Text>
            </View>
            <Text style={styles.dealTitle}>{item.title}</Text>
            <Text style={styles.dealSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity style={[styles.dealCta, { backgroundColor: item.accentColor }]} activeOpacity={0.8}>
                <Text style={[styles.dealCtaText, { color: '#0D0B1E' }]}>{item.cta}</Text>
            </TouchableOpacity>
        </View>
        <View style={[styles.dealCircle, { borderColor: item.accentColor + '30' }]} />
        <View style={[styles.dealCircleSmall, { borderColor: item.accentColor + '20' }]} />
        <Text style={styles.dealEmoji}>💎</Text>
    </LinearGradient>
);

// ─── Product Card ──────────────────────────────────────────────────────────
const ProductCard = ({ item, colors, gradients, onPress, onAddToCart }) => {
    const scale = useRef(new Animated.Value(1)).current;

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
            >
                <View style={[styles.productBadge, { backgroundColor: item.badgeColor + '25', borderColor: item.badgeColor + '60' }]}>
                    <Text style={[styles.productBadgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>
                <TouchableOpacity style={styles.wishlistIconBtn} activeOpacity={0.7}>
                    <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
                <View style={[styles.productImageBox, { backgroundColor: colors.cardAlt }]}>
                    <Text style={styles.productEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.ratingRow}>
                        <StarRating rating={item.rating} color={colors.accent} />
                        <Text style={[styles.reviewCount, { color: colors.textMuted }]}>({item.reviews})</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: colors.accent }]}>{formatPrice(item.price)}</Text>
                        <View style={[styles.discountBadge, { backgroundColor: colors.success + '20' }]}>
                            <Text style={[styles.discountText, { color: colors.success }]}>{item.discount}% OFF</Text>
                        </View>
                    </View>
                    <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                        {formatPrice(item.originalPrice)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.addToCartBtn, { borderTopColor: colors.border }]}
                    onPress={(e) => { e.stopPropagation(); onAddToCart(item); }}
                    activeOpacity={0.8}
                >
                    <LinearGradient colors={gradients.button} style={styles.addToCartGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Ionicons name="add" size={14} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Trending Card ─────────────────────────────────────────────────────────
const TrendingCard = ({ item, colors, gradients, onPress }) => (
    <TouchableOpacity
        style={[styles.trendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={onPress}
    >
        <View style={[styles.trendingImageBox, { backgroundColor: colors.cardAlt }]}>
            <Text style={styles.trendingEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.trendingInfo}>
            <Text style={[styles.trendingName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingRow}>
                <StarRating rating={item.rating} color={colors.accent} />
                <Text style={[styles.reviewCount, { color: colors.textMuted }]}> ({item.reviews})</Text>
            </View>
            <View style={styles.trendingPriceRow}>
                <Text style={[styles.trendingPrice, { color: colors.accent }]}>{formatPrice(item.price)}</Text>
                <Text style={[styles.trendingOriginal, { color: colors.textMuted }]}>{formatPrice(item.originalPrice)}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.trendingAdd} activeOpacity={0.8}>
            <LinearGradient colors={gradients.button} style={styles.trendingAddGradient}>
                <Text style={styles.trendingAddText}>+ Add</Text>
            </LinearGradient>
        </TouchableOpacity>
    </TouchableOpacity>
);

// ─── Section Header ────────────────────────────────────────────────────────
const SectionHeader = ({ title, colors, onViewAll }) => (
    <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={[styles.viewAll, { color: colors.accent }]}>View all</Text>
        </TouchableOpacity>
    </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const { isAuthenticated } = useAuth();
    const { cartItems, addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('1');
    const [dealIndex, setDealIndex] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;

    const handleAddToCart = (item) => {
        if (!isAuthenticated) {
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }
        addToCart(item, 1);
    };

    // Navigate to product detail — passing the mock detail object
    const goToDetail = (item) => navigation.navigate('ProductDetail', { product: PRODUCT_DETAIL });

    const headerBg = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: ['transparent', colors.surface],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

            {/* Header */}
            <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
                <Animated.View style={[styles.header, { backgroundColor: headerBg }]}>
                    <LinearGradient colors={gradients.header} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                    <View style={styles.headerLeft}>
                        <Text style={[styles.brandName, { color: colors.accent }]}>Gudkart</Text>
                        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back, Rahul 👋</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <NotificationBadge iconSize={20} iconColor={colors.textSecondary} />
                        <TouchableOpacity 
                            style={[styles.headerIcon, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('Main', { screen: 'Cart' })}
                        >
                            <Ionicons name="bag-outline" size={20} color={colors.textSecondary} />
                            {cartItems.length > 0 && (
                                <View style={[styles.cartBadge, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.cartBadgeText, { color: colors.textInverse }]}>{cartItems.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>

            {/* Scrollable Content */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {/* Search Bar — tapping navigates to dedicated SearchScreen */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('Search', { query: '' })}
                >
                    <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <Text style={[styles.searchInput, { color: colors.textMuted }]}>
                        Search luxury products...
                    </Text>
                    <Ionicons name="mic-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Categories */}
                <FlatList
                    data={CATEGORIES}
                    keyExtractor={(i) => i.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                    renderItem={({ item }) => (
                        <CategoryItem
                            item={item}
                            colors={colors}
                            isSelected={selectedCategory === item.id}
                            onPress={() => navigation.navigate('CategoryScreen', { category: item.name })}
                        />
                    )}
                />

                {/* Flash Deals */}
                <FlatList
                    data={FLASH_DEALS}
                    keyExtractor={(i) => i.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={DEAL_WIDTH + 12}
                    decelerationRate="fast"
                    contentContainerStyle={styles.dealsContainer}
                    onMomentumScrollEnd={(e) =>
                        setDealIndex(Math.round(e.nativeEvent.contentOffset.x / (DEAL_WIDTH + 12)))
                    }
                    renderItem={({ item }) => <FlashDealCard item={item} />}
                />

                {/* Deal Pagination Dots */}
                <View style={styles.paginationDots}>
                    {FLASH_DEALS.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, { backgroundColor: i === dealIndex ? colors.accent : colors.border, width: i === dealIndex ? 16 : 6 }]}
                        />
                    ))}
                </View>

                {/* Curated For You */}
                <SectionHeader title="Curated for You" colors={colors} onViewAll={() => { }} />
                <View style={styles.productsGrid}>
                    {CURATED_PRODUCTS.map((item) => (
                        <View key={item.id} style={styles.productCardWrapper}>
                            <ProductCard
                                item={item}
                                colors={colors}
                                gradients={gradients}
                                onPress={() => goToDetail(item)}
                                onAddToCart={handleAddToCart}
                            />
                        </View>
                    ))}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                {/* Trending Now */}
                <SectionHeader title="Trending Now" colors={colors} onViewAll={() => { }} />
                <View style={styles.trendingList}>
                    {TRENDING_PRODUCTS.map((item) => (
                        <TrendingCard key={item.id} item={item} colors={colors} gradients={gradients} onPress={() => goToDetail(item)} />
                    ))}
                </View>

                <View style={{ height: 90 }} />
            </Animated.ScrollView>
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
    headerLeft: { flex: 1 },
    brandName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    welcomeText: { fontSize: 12, fontWeight: '400', marginTop: 1 },
    headerRight: { flexDirection: 'row', gap: 10 },
    headerIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cartBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cartBadgeText: { fontSize: 9, fontWeight: '700' },
    scrollContent: { paddingTop: 8 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 20, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, borderRadius: 14, borderWidth: 1 },
    searchInput: { flex: 1, fontSize: 14 },
    categoriesContainer: { paddingHorizontal: 16, gap: 12, marginBottom: 20 },
    categoryItem: { alignItems: 'center', gap: 6, marginRight: 4 },
    categoryCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    categoryLabel: { fontSize: 11, fontWeight: '500' },
    dealsContainer: { paddingHorizontal: 16, gap: 12 },
    dealCard: { width: DEAL_WIDTH, borderRadius: 20, padding: 20, minHeight: 160, overflow: 'hidden', position: 'relative', marginRight: 12 },
    dealContent: { flex: 1, zIndex: 2 },
    dealBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
    dealBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    dealTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', lineHeight: 26, marginBottom: 6 },
    dealSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 },
    dealCta: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    dealCtaText: { fontSize: 13, fontWeight: '700' },
    dealCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, right: -30, bottom: -30 },
    dealCircleSmall: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 1, right: 20, top: -10 },
    dealEmoji: { position: 'absolute', right: 20, bottom: 20, fontSize: 48 },
    paginationDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
    dot: { height: 6, borderRadius: 3 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    viewAll: { fontSize: 13, fontWeight: '600' },
    productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
    productCardWrapper: { width: CARD_WIDTH },
    productCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    productBadge: { position: 'absolute', top: 10, left: 10, zIndex: 2, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    productBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    wishlistIconBtn: { position: 'absolute', top: 10, right: 10, zIndex: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    productImageBox: { height: 120, alignItems: 'center', justifyContent: 'center' },
    productEmoji: { fontSize: 52 },
    productInfo: { padding: 10, gap: 4 },
    productName: { fontSize: 13, fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    reviewCount: { fontSize: 10 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    price: { fontSize: 15, fontWeight: '800' },
    discountBadge: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
    discountText: { fontSize: 9, fontWeight: '700' },
    originalPrice: { fontSize: 11, textDecorationLine: 'line-through' },
    addToCartBtn: { borderTopWidth: 1 },
    addToCartGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 },
    addToCartText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    divider: { height: 1, marginHorizontal: 16, marginVertical: 24 },
    trendingList: { paddingHorizontal: 16, gap: 10 },
    trendingCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 10, gap: 12 },
    trendingImageBox: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    trendingEmoji: { fontSize: 28 },
    trendingInfo: { flex: 1, gap: 3 },
    trendingName: { fontSize: 13, fontWeight: '600' },
    trendingPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    trendingPrice: { fontSize: 14, fontWeight: '800' },
    trendingOriginal: { fontSize: 11, textDecorationLine: 'line-through' },
    trendingAdd: { borderRadius: 10, overflow: 'hidden' },
    trendingAddGradient: { paddingHorizontal: 14, paddingVertical: 8 },
    trendingAddText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});

export default HomeScreen;