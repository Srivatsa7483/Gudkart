import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';
import { SAVED_ADDRESSES } from '../../data/mockData';

const AddressListScreen = ({ navigation }) => {
    const { colors, gradients, isDark } = useTheme();
    const [addresses, setAddresses] = useState(SAVED_ADDRESSES);

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to remove this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setAddresses(addresses.filter((item) => item.id !== id));
                    },
                },
            ]
        );
    };

    const handleSetDefault = (id) => {
        setAddresses(
            addresses.map((item) => ({
                ...item,
                isDefault: item.id === id,
            }))
        );
    };

    const renderAddressCard = ({ item }) => (
        <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.accent + '15' }]}>
                        <Ionicons 
                            name={item.type === 'Home' ? 'home' : item.type === 'Work' ? 'briefcase' : 'location'} 
                            size={14} 
                            color={colors.accent} 
                        />
                        <Text style={[styles.typeText, { color: colors.accent }]}>{item.type}</Text>
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
                        onPress={() => handleDelete(item.id)}
                        style={styles.iconBtn}
                    >
                        <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {item.houseNo}, {item.area}
                </Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {item.city}, {item.state} - {item.pincode}
                </Text>
                <Text style={[styles.phoneText, { color: colors.textPrimary }]}>
                    <Ionicons name="call-outline" size={14} /> {item.phone}
                </Text>
            </View>

            {!item.isDefault && (
                <TouchableOpacity 
                    style={[styles.setDefaultBtn, { borderTopColor: colors.border }]}
                    onPress={() => handleSetDefault(item.id)}
                >
                    <Text style={[styles.setDefaultText, { color: colors.primary }]}>Set as Default</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Addresses</Text>
                <View style={{ width: 44 }} />
            </SafeAreaView>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={renderAddressCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={80} color={colors.border} />
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Addresses Saved</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Add a shipping address to speed up your checkout process.
                        </Text>
                    </View>
                }
            />

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AddEditAddress')}
                >
                    <LinearGradient
                        colors={gradients.button}
                        style={styles.addBtnGradient}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
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
        paddingBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    addressCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    defaultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    defaultText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    actionIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        padding: 4,
    },
    cardBody: {
        gap: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    setDefaultBtn: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    setDefaultText: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
    },
    addBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    addBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    addBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddressListScreen;
