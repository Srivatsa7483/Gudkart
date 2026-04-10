// ─── OrderDetailScreen.js ───────────────────────────────────────────────────
// Gudkart — Expo Go compatible
//
// Connected to orderService:
//   • Fetches order by orderId from route.params
//   • Loading skeleton + error state + pull-to-refresh (ScrollView)
//   • Cancel order with confirmation (pending/processing only)
//   • Download Invoice via orderService.downloadInvoice / getInvoiceUrl
//   • Track Shipment via orderService.trackOrder
//   • Rate Product → AddReview screen
// ──────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    ActivityIndicator,
    Linking,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';
import orderService from '../../services/api/orderService';

const { width } = Dimensions.get('window');

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

/**
 * Normalise raw API order to the shape the UI expects.
 * Mirrors the normaliser in OrdersScreen for consistency.
 */
const normaliseOrder = (raw) => ({
    id: raw._id ?? raw.id ?? '',
    date: raw.createdAt
        ? new Date(raw.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : raw.date ?? '',
    status: (() => {
        const s = (raw.status ?? '').toLowerCase();
        if (['cancelled', 'canceled'].includes(s)) return 'cancelled';
        if (s === 'delivered') return 'delivered';
        return 'active';
    })(),
    statusLabel: raw.statusLabel ?? raw.status ?? '',
    items: (raw.items ?? []).map((item) => ({
        id: item._id ?? item.id ?? item.productId ?? '',
        name: item.name ?? item.productName ?? '',
        emoji: item.emoji ?? '📦',
        qty: item.qty ?? item.quantity ?? 1,
        price: item.price ?? 0,
        desc: item.desc ?? item.description ?? '',
    })),
    total: raw.total ?? raw.totalAmount ?? 0,
    savings: raw.savings ?? raw.discount ?? 0,
    address: (() => {
        const s = raw.shippingDetails ?? {};
        if (raw.address) return raw.address;
        const parts = [s.name, s.address, s.city, s.state ? `${s.state} - ${s.pincode}` : s.pincode, s.phone ? `Phone: ${s.phone}` : ''].filter(Boolean);
        return parts.join('\n');
    })(),
    payment: raw.payment ?? raw.paymentMethod ?? '',
    trackingNumber: raw.trackingNumber ?? '',
    timeline: (raw.timeline ?? []).map((t) => ({
        label: t.label ?? t.status ?? '',
        date: t.date
            ? (typeof t.date === 'string' ? t.date : new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))
            : '',
        done: t.done ?? t.completed ?? false,
        desc: t.desc ?? t.description ?? '',
    })),
    canCancel: ['pending', 'processing'].includes((raw.status ?? '').toLowerCase()),
});

// ─── Sub-components ─────────────────────────────────────────────────────────

const TimelineItem = ({ step, isLast, colors }) => (
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
            {step.desc ? <Text style={[styles.timelineDesc, { color: colors.textSecondary }]}>{step.desc}</Text> : null}
        </View>
    </View>
);

// Simple grey skeleton bar
const SkeletonBar = ({ width: w, height: h = 14, style, colors }) => (
    <View style={[{ width: w, height: h, borderRadius: h / 2, backgroundColor: colors.border }, style]} />
);

const LoadingSkeleton = ({ colors }) => {
    const pulse = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{ opacity: pulse, paddingHorizontal: 16, paddingTop: 110 }}>
            {/* Status card */}
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.statusHeader}>
                    <SkeletonBar colors={colors} width={52} height={52} style={{ borderRadius: 26 }} />
                    <View style={{ gap: 8 }}>
                        <SkeletonBar colors={colors} width={140} height={18} />
                        <SkeletonBar colors={colors} width={100} height={12} />
                    </View>
                </View>
            </View>
            {/* Item card */}
            <SkeletonBar colors={colors} width={120} height={11} style={{ marginBottom: 10, marginLeft: 4 }} />
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, gap: 12 }]}>
                {[1, 2].map((k) => (
                    <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <SkeletonBar colors={colors} width={64} height={64} style={{ borderRadius: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonBar colors={colors} width="70%" height={14} />
                            <SkeletonBar colors={colors} width="50%" height={12} />
                        </View>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

// ─── Main Screen ───────────────────────────────────────────────────────────
const OrderDetailScreen = ({ route, navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Accept either a full `order` object (from deep link) or just `orderId`
    const orderId = route.params?.orderId ?? route.params?.order?._id ?? route.params?.order?.id;

    const [order, setOrder] = useState(
        route.params?.order ? normaliseOrder(route.params.order) : null
    );
    const [loading, setLoading] = useState(!route.params?.order);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    // ── Fetch ───────────────────────────────────────────────────────────────
    const fetchOrder = useCallback(async (isRefresh = false) => {
        if (!orderId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(normaliseOrder(data));
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId]);

    useEffect(() => {
        // If we only got orderId (or no pre-loaded order), fetch from API
        if (!order || route.params?.orderId) {
            fetchOrder();
        }
    }, []);

    // ── Cancel ──────────────────────────────────────────────────────────────
    const handleCancel = () => {
        Alert.alert(
            'Cancel Order',
            `Are you sure you want to cancel order ${order.id}?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancellingOrder(true);
                        try {
                            await orderService.cancelOrder(order.id, 'Cancelled by user');
                            setOrder((prev) => ({ ...prev, status: 'cancelled', statusLabel: 'Cancelled', canCancel: false }));
                            Alert.alert('Cancelled', 'Your order has been cancelled successfully.');
                        } catch {
                            Alert.alert('Error', 'Failed to cancel the order. Please try again.');
                        } finally {
                            setCancellingOrder(false);
                        }
                    },
                },
            ]
        );
    };

    // ── Invoice ─────────────────────────────────────────────────────────────
    const handleInvoice = async () => {
        setDownloadingInvoice(true);
        try {
            // Open the invoice URL in the device browser.
            const url = orderService.getInvoiceUrl(order.id);
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Invoice', 'Unable to open invoice. Please try again later.');
            }
        } catch {
            Alert.alert('Error', 'Failed to retrieve the invoice.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    // ── Track ───────────────────────────────────────────────────────────────
    const handleTrack = async () => {
        try {
            const tracking = await orderService.trackOrder(order.id);
            const msg = tracking.trackingNumber
                ? `Tracking #: ${tracking.trackingNumber}\nStatus: ${tracking.status}`
                : `Status: ${tracking.status}`;
            Alert.alert('Track Shipment', msg);
        } catch {
            Alert.alert('Track', 'Tracking information is not available yet.');
        }
    };

    // ── Animated header ─────────────────────────────────────────────────────
    const headerBg = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: ['transparent', colors.surface],
        extrapolate: 'clamp',
    });

    // ── Render states ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
                <SafeAreaView edges={['top']} style={styles.safeHeader}>
                    <Animated.View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Order Details</Text>
                        <View style={{ width: 40 }} />
                    </Animated.View>
                </SafeAreaView>
                <LoadingSkeleton colors={colors} />
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
                <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
                <Text style={[styles.headerTitle, { color: colors.textPrimary, textAlign: 'center' }]}>Couldn't load order</Text>
                <Text style={[styles.timelineDesc, { color: colors.textMuted, textAlign: 'center', marginTop: 8 }]}>
                    Please check your connection and try again.
                </Text>
                <TouchableOpacity onPress={() => fetchOrder()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '700' }}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';

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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchOrder(true)}
                        tintColor={colors.accent}
                        progressViewOffset={100}
                    />
                }
            >
                {/* ── Status Card ── */}
                <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statusHeader}>
                        <View style={[
                            styles.statusIcon,
                            { backgroundColor: isDelivered ? colors.success + '20' : isCancelled ? '#F8717120' : colors.primary + '20' },
                        ]}>
                            <Ionicons
                                name={isDelivered ? 'checkmark-circle' : isCancelled ? 'close-circle' : 'cube'}
                                size={24}
                                color={isDelivered ? colors.success : isCancelled ? '#F87171' : colors.primary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.statusMain, { color: colors.textPrimary }]}>
                                {isDelivered ? 'Order Delivered' : isCancelled ? 'Order Cancelled' : order.statusLabel || 'In Transit'}
                            </Text>
                            <Text style={[styles.statusId, { color: colors.textMuted }]}>{order.id}</Text>
                            <Text style={[styles.statusId, { color: colors.textMuted }]}>Placed on {order.date}</Text>
                        </View>
                    </View>

                    {/* Cancel button for cancellable orders */}
                    {order.canCancel && (
                        <>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <TouchableOpacity
                                style={styles.trackAction}
                                activeOpacity={0.7}
                                onPress={handleCancel}
                                disabled={cancellingOrder}
                            >
                                {cancellingOrder ? (
                                    <ActivityIndicator size="small" color="#F87171" />
                                ) : (
                                    <>
                                        <Text style={[styles.trackText, { color: '#F87171' }]}>Cancel Order</Text>
                                        <Ionicons name="close-circle-outline" size={16} color="#F87171" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Track shipment for active orders */}
                    {!isCancelled && !isDelivered && (
                        <>
                            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                            <TouchableOpacity style={styles.trackAction} activeOpacity={0.7} onPress={handleTrack}>
                                <Text style={[styles.trackText, { color: colors.accent }]}>Track Shipment</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* ── Items ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ITEMS ORDERED</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {order.items.map((item, index) => (
                        <View
                            key={item.id || `item-${index}`}
                            style={[
                                styles.productItem,
                                { borderBottomWidth: index < order.items.length - 1 ? 1 : 0, borderBottomColor: colors.divider },
                            ]}
                        >
                            <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardAlt }]}>
                                <Text style={styles.emoji}>{item.emoji}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                                {item.desc ? <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{item.desc}</Text> : null}
                                <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                                    Qty: {item.qty} × {formatPrice(item.price)}
                                </Text>
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

                    {/* Buy again — only for delivered orders */}
                    {isDelivered && (
                        <TouchableOpacity
                            style={styles.reorderLink}
                            activeOpacity={0.7}
                            onPress={() => Alert.alert('Buy Again', 'Added to cart!')}
                        >
                            <LinearGradient colors={gradients.button} style={styles.reorderGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Ionicons name="refresh" size={16} color="#fff" />
                                <Text style={styles.reorderText}>Buy these items again</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Delivery Timeline ── */}
                {order.timeline.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DELIVERY UPDATES</Text>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 20 }]}>
                            {order.timeline.map((step, index) => (
                                <TimelineItem
                                    key={index}
                                    step={step}
                                    isLast={index === order.timeline.length - 1}
                                    colors={colors}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* ── Shipping & Payment ── */}
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

                {/* ── Billing ── */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BILLING DETAILS</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Item Total</Text>
                        <Text style={[styles.priceValue, { color: colors.textPrimary }]}>{formatPrice(order.total + order.savings)}</Text>
                    </View>
                    {order.savings > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={[styles.priceLabel, { color: colors.success }]}>Product Discount</Text>
                            <Text style={[styles.priceValue, { color: colors.success }]}>-{formatPrice(order.savings)}</Text>
                        </View>
                    )}
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

                {/* ── Invoice Button ── */}
                <TouchableOpacity
                    style={[styles.invoiceBtn, { borderColor: downloadingInvoice ? colors.border : colors.textMuted }]}
                    activeOpacity={0.8}
                    onPress={handleInvoice}
                    disabled={downloadingInvoice}
                >
                    {downloadingInvoice ? (
                        <ActivityIndicator size="small" color={colors.textSecondary} />
                    ) : (
                        <>
                            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.invoiceBtnText, { color: colors.textSecondary }]}>Download Invoice</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 12,
        paddingTop: Platform.OS === 'android' ? 12 : 0,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
    scrollContent: { paddingTop: 100, paddingHorizontal: 16 },

    statusCard: { borderRadius: 20, borderWidth: 1, marginBottom: 20 },
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

    productItem: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
    imagePlaceholder: { width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 32 },
    itemName: { fontSize: 15, fontWeight: '700' },
    itemDesc: { fontSize: 12, marginTop: 2 },
    itemQty: { fontSize: 12, marginTop: 4 },
    itemPrice: { fontSize: 14, fontWeight: '900' },
    rateBtn: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, borderWidth: 1, marginTop: 8, alignSelf: 'flex-start', gap: 4,
    },
    rateText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    reorderLink: { padding: 16 },
    reorderGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 12, gap: 8,
    },
    reorderText: { color: '#fff', fontSize: 14, fontWeight: '800' },

    timelineItem: { flexDirection: 'row', gap: 16 },
    timelineIndicator: { alignItems: 'center', width: 24 },
    timelineDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    timelineLine: { width: 2, flex: 1, marginVertical: -4 },
    timelineContent: { flex: 1, paddingBottom: 24 },
    timelineTitle: { fontSize: 14, fontWeight: '700' },
    timelineTime: { fontSize: 11, marginTop: 2 },
    timelineDesc: { fontSize: 12, marginTop: 6, lineHeight: 18 },

    infoBlock: { flexDirection: 'row', padding: 16, gap: 16 },
    infoIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f010' },
    infoLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
    infoValue: { fontSize: 13, lineHeight: 20 },

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