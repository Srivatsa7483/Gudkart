import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';
import { SAVED_PAYMENTS } from '../../data/mockData';

const { width } = Dimensions.get('window');

const PaymentMethodsScreen = ({ navigation }) => {
    const { colors, isDark, gradients } = useTheme();
    const [payments, setPayments] = useState(SAVED_PAYMENTS);

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Payment Method',
            'Are you sure you want to remove this payment method?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: () => setPayments(payments.filter(item => item.id !== id))
                },
            ]
        );
    };

    const handleSetDefault = (id) => {
        setPayments(payments.map(item => ({
            ...item,
            isDefault: item.id === id
        })));
    };

    const renderCard = (item) => (
        <View key={item.id} style={styles.cardWrapper}>
            <LinearGradient
                colors={item.gradient || ['#4B6CB7', '#182848']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.paymentCard}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardBrand}>{item.cardType}</Text>
                    <Ionicons name="card" size={24} color="#FFF" />
                </View>
                
                <Text style={styles.cardNumber}>{item.number}</Text>
                
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.cardLabel}>CARD HOLDER</Text>
                        <Text style={styles.cardValue}>{item.holder.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.cardLabel}>EXPIRES</Text>
                        <Text style={styles.cardValue}>{item.expiry}</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.cardActions}>
                {item.isDefault ? (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                        <Text style={[styles.defaultText, { color: colors.success }]}>DEFAULT</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Text style={[styles.actionText, { color: colors.textSecondary }]}>Set as Default</Text>
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderUPI = (item) => (
        <View key={item.id} style={[styles.upiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.upiInfo}>
                <View style={[styles.upiIcon, { backgroundColor: colors.accent + '15' }]}>
                    <Ionicons name="flash" size={20} color={colors.accent} />
                </View>
                <View>
                    <Text style={[styles.upiId, { color: colors.textPrimary }]}>{item.number}</Text>
                    <Text style={[styles.upiProvider, { color: colors.textSecondary }]}>{item.provider}</Text>
                </View>
            </View>
            
            <View style={styles.upiActions}>
                {item.isDefault && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} style={{ marginLeft: 16 }} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <SafeAreaView edges={['top']} style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SAVED CARDS</Text>
                {payments.filter(p => p.type === 'card').map(renderCard)}

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 32 }]}>UPI IDS</Text>
                {payments.filter(p => p.type === 'upi').map(renderUPI)}

                <TouchableOpacity 
                    style={[styles.addBtn, { borderColor: colors.border, borderStyle: 'dashed' }]}
                    onPress={() => navigation.navigate('AddPaymentMethod')}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
                    <Text style={[styles.addBtnText, { color: colors.accent }]}>Add New Payment Method</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('AddPaymentMethod')}
                >
                    <LinearGradient
                        colors={gradients.button}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>Add New Card</Text>
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
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 16,
    },
    cardWrapper: {
        marginBottom: 24,
    },
    paymentCard: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardBrand: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        fontStyle: 'italic',
    },
    cardNumber: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 4,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 4,
    },
    actionBtn: {
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 4,
    },
    upiCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    upiInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upiIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    upiId: {
        fontSize: 14,
        fontWeight: '600',
    },
    upiProvider: {
        fontSize: 12,
        marginTop: 2,
    },
    upiActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 12,
        gap: 12,
    },
    addBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    primaryBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PaymentMethodsScreen;
