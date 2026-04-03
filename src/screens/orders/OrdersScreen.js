// ─── OrdersScreen.js ───────────────────────────────────────────────────────
// Gudkart — Expo Go compatible
//
// Features:
//   • Filter tabs — All, Active, Delivered, Cancelled
//   • Order cards with:
//       - Order ID + date
//       - Product previews (emoji stack)
//       - Status pill with colour + icon
//       - Delivery timeline progress bar
//       - Total amount
//       - Action buttons: Track / Reorder / Rate / Return
//   • Empty state per filter tab
//   • Animated card entry (stagger fade-in)
//   • Order Detail bottom sheet (inline expand)
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Dimensions,
    StatusBar,
    Animated,
    Platform,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

// ─── Mock Orders Data ──────────────────────────────────────────────────────
const ORDERS = [
    {
        id: 'GK-2025-8821',
        date: '28 Mar 2025',
        status: 'delivered',
        deliveredDate: '30 Mar 2025',
        items: [
            { name: 'Gold Watch Pro', emoji: '⌚', qty: 1, price: 8999 },
            { name: 'Leather Wallet', emoji: '👛', qty: 1, price: 1299 },
        ],
        total: 10298,
        savings: 4701,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'UPI · GPay',
        timeline: [
            { label: 'Ordered', done: true, date: '28 Mar' },
            { label: 'Packed', done: true, date: '28 Mar' },
            { label: 'Shipped', done: true, date: '29 Mar' },
            { label: 'Delivered', done: true, date: '30 Mar' },
        ],
        canReturn: true,
        canRate: true,
    },
    {
        id: 'GK-2025-8754',
        date: '22 Mar 2025',
        status: 'active',
        statusLabel: 'Out for Delivery',
        estimatedDate: 'Today by 8 PM',
        items: [
            { name: 'Sony WH-1000XM5', emoji: '🎧', qty: 1, price: 18999 },
        ],
        total: 18999,
        savings: 10991,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'Credit Card · HDFC',
        timeline: [
            { label: 'Ordered', done: true, date: '22 Mar' },
            { label: 'Packed', done: true, date: '23 Mar' },
            { label: 'Shipped', done: true, date: '24 Mar' },
            { label: 'Delivered', done: false, date: 'Today' },
        ],
        canTrack: true,
    },
    {
        id: 'GK-2025-8690',
        date: '15 Mar 2025',
        status: 'active',
        statusLabel: 'Processing',
        estimatedDate: '2 Apr 2025',
        items: [
            { name: 'Diamond Pendant', emoji: '💎', qty: 1, price: 12500 },
            { name: 'Silk Kurta Set', emoji: '👗', qty: 2, price: 6400 },
        ],
        total: 18900,
        savings: 7600,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'Net Banking · SBI',
        timeline: [
            { label: 'Ordered', done: true, date: '15 Mar' },
            { label: 'Packed', done: true, date: '16 Mar' },
            { label: 'Shipped', done: false, date: 'Soon' },
            { label: 'Delivered', done: false, date: '2 Apr' },
        ],
        canTrack: true,
    },
    {
        id: 'GK-2025-8541',
        date: '8 Mar 2025',
        status: 'delivered',
        deliveredDate: '11 Mar 2025',
        items: [
            { name: 'Air Max Prestige', emoji: '👟', qty: 1, price: 4299 },
        ],
        total: 4299,
        savings: 2701,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'UPI · PhonePe',
        timeline: [
            { label: 'Ordered', done: true, date: '8 Mar' },
            { label: 'Packed', done: true, date: '9 Mar' },
            { label: 'Shipped', done: true, date: '10 Mar' },
            { label: 'Delivered', done: true, date: '11 Mar' },
        ],
        canReturn: true,
        canRate: true,
    },
    {
        id: 'GK-2025-8312',
        date: '1 Mar 2025',
        status: 'cancelled',
        cancelledDate: '1 Mar 2025',
        cancelReason: 'Cancelled by user',
        items: [
            { name: 'MacBook Air M3', emoji: '💻', qty: 1, price: 114900 },
        ],
        total: 114900,
        savings: 15000,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'Credit Card · ICICI',
        timeline: [
            { label: 'Ordered', done: true, date: '1 Mar' },
            { label: 'Cancelled', done: true, date: '1 Mar' },
        ],
        refundStatus: 'Refund processed · ₹1,14,900',
        canReorder: true,
    },
    {
        id: 'GK-2025-7988',
        date: '18 Feb 2025',
        status: 'delivered',
        deliveredDate: '21 Feb 2025',
        items: [
            { id: 'oi1', name: 'Smart Speaker', emoji: '🔊', qty: 1, price: 5499 },
            { id: 'oi2', name: 'Indoor Plant Pot', emoji: '🪴', qty: 2, price: 1398 },
        ],
        total: 6897,
        savings: 3203,
        address: 'Rahul Mehta, 42 MG Road, Bengaluru - 560001',
        payment: 'COD',
        timeline: [
            { label: 'Ordered', done: true, date: '18 Feb' },
            { label: 'Packed', done: true, date: '19 Feb' },
            { label: 'Shipped', done: true, date: '20 Feb' },
            { label: 'Delivered', done: true, date: '21 Feb' },
        ],
        canReturn: false,
        canRate: true,
    },
];

const FILTER_TABS = [
    { id: 'all', label: 'All', icon: 'layers-outline' },
    { id: 'active', label: 'Active', icon: 'time-outline' },
    { id: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
    { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

const STATUS_CONFIG = {
    active: {
        color: '#60A5FA',
        bg: '#60A5FA20',
        icon: 'time-outline',
    },
    delivered: {
        color: '#4ADE80',
        bg: '#4ADE8020',
        icon: 'checkmark-circle-outline',
    },
    cancelled: {
        color: '#F87171',
        bg: '#F8717120',
        icon: 'close-circle-outline',
    },
};

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// ─── Timeline Step ─────────────────────────────────────────────────────────
const TimelineStep = ({ step, index, total, colors, isCancelled }) => {
    const isLast = index === total - 1;
    const dotColor = step.done
        ? isCancelled && index > 0 ? '#F87171' : colors.success
        : colors.border;
    const lineColor = step.done ? (isCancelled && index > 0 ? '#F87171' : colors.success) : colors.border;

    return (
        <View style={styles.timelineStep}>
            {/* Line above dot */}
            {index > 0 && (
                <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />
            )}
            {/* Dot */}
            <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: dotColor }]}>
                {step.done && (
                    <Ionicons
                        name={isCancelled && index > 0 ? 'close' : 'checkmark'}
                        size={8}
                        color="#fff"
                    />
                )}
            </View>
            {/* Label */}
            <Text style={[styles.timelineLabel, { color: step.done ? colors.textSecondary : colors.textMuted }]}>
                {step.label}
            </Text>
            <Text style={[styles.timelineDate, { color: step.done ? colors.accent : colors.textMuted }]}>
                {step.date}
            </Text>
        </View>
    );
};

// ─── Order Detail Modal ────────────────────────────────────────────────────
const OrderDetailModal = ({ order, visible, onClose, colors, gradients }) => {
    if (!order) return null;
    const cfg = STATUS_CONFIG[order.status];
    const isCancelled = order.status === 'cancelled';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={[styles.detailSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Order ID + status */}
                        <View style={styles.detailHeader}>
                            <View>
                                <Text style={[styles.detailOrderId, { color: colors.textPrimary }]}>{order.id}</Text>
                                <Text style={[styles.detailDate, { color: colors.textMuted }]}>Placed on {order.date}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                                <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                                <Text style={[styles.statusText, { color: cfg.color }]}>
                                    {order.statusLabel ?? order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Text>
                            </View>
                        </View>

                        {/* Items */}
                        <Text style={[styles.detailSectionTitle, { color: colors.textMuted }]}>ITEMS</Text>
                        {order.items.map((item, i) => (
                            <View key={i} style={[styles.detailItem, { borderBottomColor: colors.divider, borderBottomWidth: i < order.items.length - 1 ? 1 : 0 }]}>
                                <View style={[styles.detailItemEmoji, { backgroundColor: colors.card }]}>
                                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.detailItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                                    <Text style={[styles.detailItemQty, { color: colors.textMuted }]}>Qty: {item.qty}</Text>
                                </View>
                                <Text style={[styles.detailItemPrice, { color: colors.accent }]}>{formatPrice(item.price)}</Text>
                            </View>
                        ))}

                        {/* Timeline */}
                        <Text style={[styles.detailSectionTitle, { color: colors.textMuted, marginTop: 16 }]}>TIMELINE</Text>
                        <View style={styles.timelineRow}>
                            {order.timeline.map((step, i) => (
                                <TimelineStep
                                    key={i}
                                    step={step}
                                    index={i}
                                    total={order.timeline.length}
                                    colors={colors}
                                    isCancelled={isCancelled}
                                />
                            ))}
                        </View>

                        {/* Address + Payment */}
                        <Text style={[styles.detailSectionTitle, { color: colors.textMuted, marginTop: 16 }]}>DELIVERY ADDRESS</Text>
                        <View style={[styles.detailInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="location-outline" size={16} color={colors.primary} />
                            <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>{order.address}</Text>
                        </View>

                        <Text style={[styles.detailSectionTitle, { color: colors.textMuted, marginTop: 12 }]}>PAYMENT</Text>
                        <View style={[styles.detailInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="card-outline" size={16} color={colors.primary} />
                            <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>{order.payment}</Text>
                        </View>

                        {/* Price summary */}
                        <Text style={[styles.detailSectionTitle, { color: colors.textMuted, marginTop: 12 }]}>PRICE SUMMARY</Text>
                        <View style={[styles.priceSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Order Total</Text>
                                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatPrice(order.total)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.success }]}>You Saved</Text>
                                <Text style={[styles.summaryValue, { color: colors.success }]}>-{formatPrice(order.savings)}</Text>
                            </View>
                            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10, marginTop: 4 }]}>
                                <Text style={[styles.summaryLabel, { color: colors.textPrimary, fontWeight: '700' }]}>Total Paid</Text>
                                <Text style={[styles.totalPaid, { color: colors.accent }]}>{formatPrice(order.total)}</Text>
                            </View>
                        </View>

                        {/* Refund info */}
                        {order.refundStatus && (
                            <View style={[styles.refundCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '40' }]}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Text style={[styles.refundText, { color: colors.success }]}>{order.refundStatus}</Text>
                            </View>
                        )}

                        <View style={{ height: 24 }} />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

// ─── Order Card ────────────────────────────────────────────────────────────
const OrderCard = ({ order, colors, gradients, onPress, animDelay, navigation }) => {
    const cfg = STATUS_CONFIG[order.status];
    const isCancelled = order.status === 'cancelled';
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: animDelay, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: animDelay, useNativeDriver: true }),
        ]).start();
    }, []);

    // Progress bar — count done steps
    const doneSteps = order.timeline.filter((s) => s.done).length;
    const totalSteps = order.timeline.length;
    const progress = doneSteps / totalSteps;

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity
                style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={onPress}
                activeOpacity={0.88}
            >
                {/* ── Top row ── */}
                <View style={styles.cardTopRow}>
                    <View>
                        <Text style={[styles.orderId, { color: colors.textPrimary }]}>{order.id}</Text>
                        <Text style={[styles.orderDate, { color: colors.textMuted }]}>{order.date}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                        <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                        <Text style={[styles.statusText, { color: cfg.color }]}>
                            {order.statusLabel ?? order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* ── Product emoji preview ── */}
                <View style={styles.itemsPreview}>
                    {order.items.slice(0, 3).map((item, i) => (
                        <View
                            key={i}
                            style={[
                                styles.emojiChip,
                                { backgroundColor: colors.cardAlt, borderColor: colors.border, marginLeft: i > 0 ? -8 : 0 },
                            ]}
                        >
                            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                        </View>
                    ))}
                    {order.items.length > 3 && (
                        <View style={[styles.emojiChip, styles.moreChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40', marginLeft: -8 }]}>
                            <Text style={[styles.moreText, { color: colors.primary }]}>+{order.items.length - 3}</Text>
                        </View>
                    )}
                    <View style={styles.itemNamesCol}>
                        <Text style={[styles.itemNamesText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {order.items.map((i) => i.name).join(', ')}
                        </Text>
                        <Text style={[styles.itemCount, { color: colors.textMuted }]}>
                            {order.items.reduce((a, i) => a + i.qty, 0)} item{order.items.reduce((a, i) => a + i.qty, 0) > 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* ── Progress bar ── */}
                {!isCancelled && (
                    <View style={styles.progressSection}>
                        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${progress * 100}%`,
                                        backgroundColor: order.status === 'delivered' ? colors.success : colors.primary,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                            {order.status === 'delivered'
                                ? `✅ Delivered on ${order.deliveredDate}`
                                : `🚚 Estimated: ${order.estimatedDate}`}
                        </Text>
                    </View>
                )}

                {/* Cancelled refund info */}
                {isCancelled && order.refundStatus && (
                    <View style={[styles.refundChip, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
                        <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                        <Text style={[styles.refundChipText, { color: colors.success }]}>{order.refundStatus}</Text>
                    </View>
                )}

                {/* ── Divider ── */}
                <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />

                {/* ── Bottom row — total + actions ── */}
                <View style={styles.cardBottomRow}>
                    <View>
                        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: colors.accent }]}>{formatPrice(order.total)}</Text>
                    </View>

                    <View style={styles.actionBtns}>
                        {order.canTrack && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: colors.primary + '60', backgroundColor: colors.primary + '15' }]}
                                onPress={() => Alert.alert('Track Order', `Tracking ${order.id}...`)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="navigate-outline" size={13} color={colors.primary} />
                                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Track</Text>
                            </TouchableOpacity>
                        )}
                        {order.canRate && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: colors.accent + '60', backgroundColor: colors.accent + '15' }]}
                                onPress={() => navigation.navigate('OrderDetail', { order })}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="star-outline" size={13} color={colors.accent} />
                                <Text style={[styles.actionBtnText, { color: colors.accent }]}>Rate</Text>
                            </TouchableOpacity>
                        )}
                        {order.canReturn && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: colors.textMuted + '60', backgroundColor: colors.card }]}
                                onPress={() => Alert.alert('Return', `Return request for ${order.id}`)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="return-down-back-outline" size={13} color={colors.textMuted} />
                                <Text style={[styles.actionBtnText, { color: colors.textMuted }]}>Return</Text>
                            </TouchableOpacity>
                        )}
                        {order.canReorder && (
                            <TouchableOpacity
                                style={styles.reorderBtn}
                                onPress={() => Alert.alert('Reorder', `Reordering items from ${order.id}`)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={gradients.button}
                                    style={styles.reorderGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="refresh-outline" size={13} color="#fff" />
                                    <Text style={styles.reorderText}>Reorder</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* View details chevron */}
                        <TouchableOpacity
                            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
                            onPress={onPress}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Empty State ───────────────────────────────────────────────────────────
const EmptyState = ({ filter, colors, onShop }) => {
    const configs = {
        all: { emoji: '📦', title: 'No orders yet', sub: 'Start shopping to see your orders here' },
        active: { emoji: '🚚', title: 'No active orders', sub: 'All your deliveries are complete!' },
        delivered: { emoji: '✅', title: 'No delivered orders', sub: 'Your delivered orders will appear here' },
        cancelled: { emoji: '🚫', title: 'No cancelled orders', sub: "You haven't cancelled any orders" },
    };
    const { emoji, title, sub } = configs[filter] ?? configs.all;

    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{emoji}</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>{sub}</Text>
            {filter === 'all' && (
                <TouchableOpacity style={styles.shopBtn} onPress={onShop} activeOpacity={0.85}>
                    <Text style={[styles.shopBtnText, { color: colors.accent }]}>Start Shopping →</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Main Screen ───────────────────────────────────────────────────────────
const OrdersScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const filteredOrders = activeFilter === 'all'
        ? ORDERS
        : ORDERS.filter((o) => o.status === activeFilter);

    const openDetail = (order) => {
        navigation.navigate('OrderDetail', { order });
    };

    // Count per filter
    const counts = {
        all: ORDERS.length,
        active: ORDERS.filter((o) => o.status === 'active').length,
        delivered: ORDERS.filter((o) => o.status === 'delivered').length,
        cancelled: ORDERS.filter((o) => o.status === 'cancelled').length,
    };

    const headerHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 60;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation?.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Orders</Text>
                        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{counts.all} orders total</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.searchIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* ── Filter Tabs ─────────────────────────────────────────────── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterTabs}
                >
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.filterTab,
                                    {
                                        backgroundColor: isActive ? colors.accent : colors.card,
                                        borderColor: isActive ? colors.accent : colors.border,
                                    },
                                ]}
                                onPress={() => setActiveFilter(tab.id)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={tab.icon} size={14} color={isActive ? colors.textInverse : colors.textMuted} />
                                <Text style={[styles.filterTabText, { color: isActive ? colors.textInverse : colors.textSecondary }]}>
                                    {tab.label}
                                </Text>
                                {counts[tab.id] > 0 && (
                                    <View style={[styles.filterCount, { backgroundColor: isActive ? 'rgba(0,0,0,0.1)' : colors.accent + '20' }]}>
                                        <Text style={[styles.filterCountText, { color: isActive ? colors.textInverse : colors.accent }]}>
                                            {counts[tab.id]}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>

            {/* ── Orders List ─────────────────────────────────────────────────── */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    filter={activeFilter}
                    colors={colors}
                    onShop={() => navigation?.navigate('Main', { screen: 'Home' })}
                />
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(o) => o.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <OrderCard
                            order={item}
                            colors={colors}
                            gradients={gradients}
                            onPress={() => openDetail(item)}
                            animDelay={index * 80}
                            navigation={navigation}
                        />
                    )}
                    ListFooterComponent={<View style={{ height: 90 }} />}
                />
            )}
        </View>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    headerSub: { fontSize: 11, fontWeight: '400', marginTop: 1 },
    searchIconBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

    // Filter tabs
    filterTabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterTabText: { fontSize: 13, fontWeight: '600' },
    filterCount: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
    filterCountText: { fontSize: 10, fontWeight: '700' },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },

    // Order card
    orderCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
    orderId: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
    orderDate: { fontSize: 11, marginTop: 2 },

    // Status pill
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },

    // Items preview
    itemsPreview: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    emojiChip: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    moreChip: {},
    moreText: { fontSize: 11, fontWeight: '700' },
    itemNamesCol: { flex: 1, marginLeft: 10 },
    itemNamesText: { fontSize: 12, fontWeight: '500' },
    itemCount: { fontSize: 11, marginTop: 2 },

    // Progress
    progressSection: { marginBottom: 14 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 2 },
    progressLabel: { fontSize: 11 },

    // Refund chip
    refundChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1, borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 6,
        marginBottom: 12, alignSelf: 'flex-start',
    },
    refundChipText: { fontSize: 11, fontWeight: '600' },

    // Divider
    cardDivider: { height: 1, marginBottom: 12 },

    // Bottom row
    cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalLabel: { fontSize: 11 },
    totalValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
    actionBtns: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderRadius: 8, borderWidth: 1,
        paddingHorizontal: 10, paddingVertical: 6,
    },
    actionBtnText: { fontSize: 11, fontWeight: '600' },
    reorderBtn: { borderRadius: 8, overflow: 'hidden' },
    reorderGradient: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 7,
    },
    reorderText: { fontSize: 11, fontWeight: '700', color: '#fff' },

    // Empty
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10 },
    emptyEmoji: { fontSize: 56, marginBottom: 8 },
    emptyTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    shopBtn: { marginTop: 8 },
    shopBtnText: { fontSize: 15, fontWeight: '700' },

    // Detail modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    detailSheet: {
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        paddingTop: 12,
        maxHeight: height * 0.88,
    },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    detailHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
    detailOrderId: { fontSize: 16, fontWeight: '800' },
    detailDate: { fontSize: 12, marginTop: 3 },
    detailSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    detailItemEmoji: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    detailItemName: { fontSize: 13, fontWeight: '600' },
    detailItemQty: { fontSize: 11, marginTop: 2 },
    detailItemPrice: { fontSize: 14, fontWeight: '800' },

    // Timeline (horizontal)
    timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    timelineStep: { flex: 1, alignItems: 'center', gap: 4 },
    timelineLine: { position: 'absolute', left: -50, right: 50, top: 8, height: 2 },
    timelineDot: {
        width: 18, height: 18, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, zIndex: 1,
    },
    timelineLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
    timelineDate: { fontSize: 9, textAlign: 'center' },

    detailInfoCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        borderRadius: 12, borderWidth: 1,
        padding: 12, marginBottom: 4,
    },
    detailInfoText: { flex: 1, fontSize: 13, lineHeight: 18 },

    // Price summary
    priceSummary: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13 },
    summaryValue: { fontSize: 13, fontWeight: '600' },
    totalPaid: { fontSize: 16, fontWeight: '900' },

    // Refund card
    refundCard: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: 10, borderWidth: 1,
        padding: 12, marginTop: 12,
    },
    refundText: { fontSize: 13, fontWeight: '600' },
});

export default OrdersScreen;