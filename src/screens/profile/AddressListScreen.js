import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { useFocusEffect } from '@react-navigation/native';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import addressService from '../../services/api/addressService';

const AddressListScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // addressId being acted on

    // Fetch addresses on focus (re-fetches when returning from Add/Edit)
    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [user?.uid])
    );

    const fetchAddresses = async (isRefresh = false) => {
        if (!user?.uid) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await addressService.getAddresses(user.uid);
            // API returns { success, addresses: [...] }
            const list = data?.addresses || data || [];
            setAddresses(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('[AddressListScreen] fetch error:', err);
            Alert.alert('Error', 'Could not load your addresses. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = (address) => {
        Alert.alert(
            'Delete Address',
            `Remove "${address.addressLine || address.city}" from your saved addresses?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const addrId = address.id || address._id;
                        setActionLoading(addrId);
                        try {
                            await addressService.deleteAddress(user.uid, addrId);
                            setAddresses(prev => prev.filter(a => (a.id || a._id) !== addrId));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete address. Please try again.');
                        } finally {
                            setActionLoading(null);
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (address) => {
        const addrId = address.id || address._id;
        if (address.isDefault) return; // already default
        setActionLoading(addrId);
        try {
            // POST the same address with isDefault: true — backend handles removing the flag from others
            await addressService.addAddress(user.uid, {
                ...address,
                isDefault: true,
            });
            // Optimistic UI update
            setAddresses(prev =>
                prev.map(a => ({
                    ...a,
                    isDefault: (a.id || a._id) === addrId,
                }))
            );
        } catch (err) {
            Alert.alert('Error', 'Failed to set default address. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeIcon = (type) => {
        if (!type) return 'location';
        const t = type.toLowerCase();
        if (t === 'home' || t === 'shipping') return 'home';
        if (t === 'work') return 'briefcase';
        return 'location';
    };

    const getTypeLabel = (type) => {
        if (!type) return 'Address';
        const t = type.toLowerCase();
        if (t === 'shipping') return 'Shipping';
        if (t === 'billing') return 'Billing';
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const renderAddressCard = ({ item }) => {
        const addrId = item.id || item._id;
        const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || item.name || 'No Name';
        const isActing = actionLoading === addrId;

        return (
            <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: item.isDefault ? colors.primary : colors.border }]}>
                {/* Busy overlay */}
                {isActing && (
                    <View style={styles.busyOverlay}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                )}

                <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                        <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons
                                name={getTypeIcon(item.type)}
                                size={14}
                                color={colors.primary}
                            />
                            <Text style={[styles.typeText, { color: colors.primary }]}>{getTypeLabel(item.type)}</Text>
                        </View>
                        {item.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.defaultText}>DEFAULT</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddEditAddress', { address: item })}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item)}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{name}</Text>
                    {item.addressLine ? (
                        <Text style={[styles.addressText, { color: colors.textSecondary }]}>{item.addressLine}</Text>
                    ) : null}
                    {item.landmark ? (
                        <Text style={[styles.addressText, { color: colors.textSecondary }]}>Near {item.landmark}</Text>
                    ) : null}
                    <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                        {[item.city, item.state].filter(Boolean).join(', ')}{item.pincode ? ` - ${item.pincode}` : ''}
                    </Text>
                    {item.phone ? (
                        <View style={styles.phoneRow}>
                            <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.phoneText, { color: colors.textPrimary }]}>{item.phone}</Text>
                        </View>
                    ) : null}
                </View>

                {!item.isDefault && (
                    <TouchableOpacity
                        style={[styles.setDefaultBtn, { borderTopColor: colors.border }]}
                        onPress={() => handleSetDefault(item)}
                    >
                        <Text style={[styles.setDefaultText, { color: colors.primary }]}>Set as Default</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Addresses</Text>
                    {!loading && (
                        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                            {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
                        </Text>
                    )}
                </View>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            {loading ? (
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading addresses…</Text>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => String(item.id || item._id)}
                    renderItem={renderAddressCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchAddresses(true)}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="location-outline" size={48} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Addresses Saved</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                Add a shipping address to speed up your checkout.
                            </Text>
                        </View>
                    }
                />
            )}

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AddEditAddress')}
                >
                    <LinearGradient
                        colors={(gradients?.button || []).every(Boolean) ? gradients.button : ['#7B5EEA', '#5A3EC8']}
                        style={styles.addBtnGradient}
                    >
                        <Ionicons name="add" size={22} color="#FFF" />
                        <Text style={styles.addBtnText}>Add New Address</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 12,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    headerSub: { fontSize: 12, marginTop: 2 },

    loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14 },

    listContent: { padding: 16, paddingBottom: 120 },

    addressCard: {
        borderRadius: 20, borderWidth: 1.5,
        padding: 16, marginBottom: 16, overflow: 'hidden',
        position: 'relative',
    },
    busyOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10, borderRadius: 20,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 12,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4,
    },
    typeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    defaultText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    actionIcons: { flexDirection: 'row', gap: 8 },
    iconBtn: { padding: 6 },

    cardBody: { gap: 4 },
    userName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    addressText: { fontSize: 14, lineHeight: 20 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    phoneText: { fontSize: 14, fontWeight: '600' },

    setDefaultBtn: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, alignItems: 'center' },
    setDefaultText: { fontSize: 14, fontWeight: '700' },

    emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40, gap: 12 },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 20, fontWeight: '800' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36 },
    addBtn: { borderRadius: 16, overflow: 'hidden' },
    addBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, gap: 8,
    },
    addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AddressListScreen;
