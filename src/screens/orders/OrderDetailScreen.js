// ─── OrderDetailScreen.js ───────────────────────────────────────────────────
// Gudkart — Expo Go compatible
//
// Features:
//   • Detailed timeline with location updates
//   • Order summary — items, pricing, savings
//   • Shipping & Billing details
//   • Premium actions — Track, Buy Again, Invoice
// ──────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    Animated,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// ─── Timeline Item ─────────────────────────────────────────────────────────
const TimelineItem = ({ step, isLast, colors }) => {
    return (
        <View style={styles.timelineItem}>
            <View style={styles.timelineIndicator}>
                <View style={[styles.timelineDot, { backgroundColor: step.done ? colors.success : colors.border }]}>
                    {step.done && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: step.done ? colors.success : colors.border }]} />}
            </View>
            <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: step.done ? colors.textPrimary : colors.textMuted }]}>{step.label}</Text>
                <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{step.date}</Text>
                {step.desc && <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>{step.desc}</Text>}
            </View>
        </View>
    );
};

const OrderDetailScreen = ({ route, navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Use passed order or default mock
    const order = route.params?.order || {
        id: 'GK-2025-8821',
        date: '28 Mar 2025',
        status: 'delivered',
        items: [
            { id: 'p1', name: 'Gold Watch Pro', emoji: '⌚', qty: 1, price: 8999, desc: 'Luxury edition' },
            { id: 'p2', name: 'Leather Wallet', emoji: '👛', qty: 1, price: 1299, desc: 'Genuine brown leather' },
        ],
        total: 10298,
        savings: 4701,
        address: 'Rahul Mehta\n42 MG Road, Indiranagar\nBengaluru, KA - 560001\nPhone: +91 98765 43210',
        payment: 'UPI · Google Pay',
        timeline: [
            { label: 'Order Confirmed', date: '28 Mar, 10:30 AM', done: true, desc: 'Your order has been placed successfully.' },
            { label: 'Packed', date: '28 Mar, 04:15 PM', done: true, desc: 'Quality check completed at Bengaluru facility.' },
            { label: 'Shipped', date: '29 Mar, 09:00 AM', done: true, desc: 'Carrier: BlueDart Express (A99221)' },
            { label: 'Delivered', date: '30 Mar, 02:45 PM', done: true, desc: 'Signed by: Rahul' },
        ],
    };

    const headerBg = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: ['transparent', colors.surface],
        extrapolate: 'clamp',
    });

    const isDelivered = order.status === 'delivered';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

            {/* Floating Header */}
            <SafeAreaView edges={['top']} style={styles.safeHeader}>
                <Animated.View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Order Details</Text>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Help', 'Support team will contact you shortly.')}
                        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Status Card ── */}
                <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusIcon, { backgroundColor: isDelivered ? colors.success + '20' : colors.primary + '20' }]}>
                            <Ionicons name={isDelivered ? 'checkmark-circle' : 'cube'} size={24} color={isDelivered ? colors.success : colors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.statusMain, { color: colors.textPrimary }]}>
                                {isDelivered ? 'Order Delivered' : 'In Transit'}
                            </Text>
                            <Text style={[styles.statusId, { color: colors.textMuted }]}>{order.id}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    <TouchableOpacity style={styles.trackAction} activeOpacity={0.7} onPress={() => Alert.alert('Track', 'Opening map...')}>
                        <Text style={[styles.trackText, { color: colors.accent }]}>Track Shipment</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                    </TouchableOpacity>
                </View>

                {/* ── Items ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ITEMS ORDERED</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {order.items.map((item, index) => (
                        <View key={item.id || `item-${index}`} style={[styles.productItem, { borderBottomWidth: index < order.items.length - 1 ? 1 : 0, borderBottomColor: colors.divider }]}>
                            <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardAlt }]}>
                                <Text style={styles.emoji}>{item.emoji}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                                <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                                <Text style={[styles.itemQty, { color: colors.textSecondary }]}>Qty: {item.qty} × {formatPrice(item.price)}</Text>
                                
                                {isDelivered && (
                                    <TouchableOpacity 
                                        style={[styles.rateBtn, { borderColor: colors.accent }]}
                                        onPress={() => navigation.navigate('AddReview', { product: item })}
                                    >
                                        <Ionicons name="star-outline" size={12} color={colors.accent} />
                                        <Text style={[styles.rateText, { color: colors.accent }]}>Rate Product</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={[styles.itemPrice, { color: colors.accent }]}>{formatPrice(item.price * item.qty)}</Text>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.reorderLink} activeOpacity={0.7} onPress={() => Alert.alert('Buy Again', 'Added to cart!')}>
                        <LinearGradient colors={gradients.button} style={styles.reorderGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="refresh" size={16} color="#fff" />
                            <Text style={styles.reorderText}>Buy these items again</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── Delivery Timeline ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DELIVERY UPDATES</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 20 }]}>
                    {order.timeline.map((step, index) => (
                        <TimelineItem key={index} step={step} isLast={index === order.timeline.length - 1} colors={colors} />
                    ))}
                </View>

                {/* ── Shipping Info ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SHIPPING & PAYMENT</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.infoBlock}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="location-outline" size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Delivery Address</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{order.address}</Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.divider, marginLeft: 50 }]} />
                    <View style={styles.infoBlock}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="card-outline" size={18} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Payment Mode</Text>
                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{order.payment}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Price Summary ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BILLING DETAILS</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Item Total</Text>
                        <Text style={[styles.priceValue, { color: colors.textPrimary }]}>{formatPrice(order.total + order.savings)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.success }]}>Product Discount</Text>
                        <Text style={[styles.priceValue, { color: colors.success }]}>-{formatPrice(order.savings)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                        <Text style={[styles.priceValue, { color: colors.success }]}>FREE</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: 8 }]} />
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceTotalLabel, { color: colors.textPrimary }]}>Total Amount</Text>
                        <Text style={[styles.priceTotalValue, { color: colors.accent }]}>{formatPrice(order.total)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <TouchableOpacity style={styles.invoiceBtn} activeOpacity={0.8} onPress={() => Alert.alert('Download', 'Generating PDF...')}>
                    <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.invoiceBtnText, { color: colors.textSecondary }]}>Download Invoice</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: Platform.OS === 'android' ? 12 : 0,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
    scrollContent: { paddingTop: 100, paddingHorizontal: 16 },

    // Status Card
    statusCard: {
        borderRadius: 20, borderWidth: 1,
        marginBottom: 20,
    },
    statusHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    statusIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    statusMain: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
    statusId: { fontSize: 12, marginTop: 2 },
    divider: { height: 1 },
    trackAction: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    trackText: { fontSize: 14, fontWeight: '700' },

    sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginLeft: 4, marginBottom: 10, marginTop: 10 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },

    // Product List
    productItem: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
    imagePlaceholder: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 32 },
    itemName: { fontSize: 15, fontWeight: '700' },
    itemDesc: { fontSize: 12, marginTop: 2 },
    itemQty: { fontSize: 12, marginTop: 4 },
    itemPrice: { fontSize: 14, fontWeight: '900' },
    rateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    rateText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    reorderLink: { padding: 16 },
    reorderGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 12, gap: 8,
    },
    reorderText: { color: '#fff', fontSize: 14, fontWeight: '800' },

    // Timeline
    timelineItem: { flexDirection: 'row', gap: 16 },
    timelineIndicator: { alignItems: 'center', width: 24 },
    timelineDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    timelineLine: { width: 2, flex: 1, marginVertical: -4 },
    timelineContent: { flex: 1, paddingBottom: 24 },
    timelineTitle: { fontSize: 14, fontWeight: '700' },
    timelineTime: { fontSize: 11, marginTop: 2 },
    timelineDesc: { fontSize: 12, marginTop: 6, lineHeight: 18 },

    // Info Blocks
    infoBlock: { flexDirection: 'row', padding: 16, gap: 16 },
    infoIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f010' },
    infoLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
    infoValue: { fontSize: 13, lineHeight: 20 },

    // Billing
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 13 },
    priceValue: { fontSize: 13, fontWeight: '600' },
    priceTotalLabel: { fontSize: 15, fontWeight: '800' },
    priceTotalValue: { fontSize: 18, fontWeight: '900' },

    invoiceBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', gap: 10,
        marginTop: 10,
    },
    invoiceBtnText: { fontSize: 14, fontWeight: '600' },
});

export default OrderDetailScreen;
