import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '../../hooks/useTheme';

const ThemeSettingsScreen = ({ navigation }) => {
    const { colors, gradients, isDark, setMode } = useTheme();

    const themes = [
        {
            id: 'light',
            name: 'Classic Light',
            description: 'Clean, crisp and readable. Perfect for daylight.',
            icon: 'sunny-outline',
            isActive: !isDark,
            colors: ['#FFFFFF', '#F8F9FA', '#E9ECEF'],
        },
        {
            id: 'dark',
            name: 'Midnight Pro',
            description: 'Deep purples and blacks. Easy on the eyes.',
            icon: 'moon-outline',
            isActive: isDark,
            colors: ['#0D0B1E', '#1A1040', '#2E2850'],
        },
    ];

    const handleThemeSelect = (themeId) => {
        setMode(themeId);
    };

    const ThemeCard = ({ theme }) => (
        <TouchableOpacity
            style={[
                styles.themeCard,
                { backgroundColor: theme.isActive ? colors.cardAlt : colors.surface },
                theme.isActive && { borderColor: colors.accent, borderWidth: 2 }
            ]}
            onPress={() => handleThemeSelect(theme.id)}
            activeOpacity={0.8}
        >
            <View style={[styles.themeIcon, { backgroundColor: theme.isActive ? colors.accent : colors.border }]}>
                <Ionicons name={theme.icon} size={28} color={theme.isActive ? '#fff' : colors.textMuted} />
            </View>

            <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: colors.textPrimary }]}>{theme.name}</Text>
                <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>{theme.description}</Text>
            </View>

            <View style={styles.previewStack}>
                {theme.colors.map((c, i) => (
                    <View key={i} style={[styles.colorBubble, { backgroundColor: c, marginLeft: i === 0 ? 0 : -8 }]} />
                ))}
            </View>

            {theme.isActive && (
                <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Appearance</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.introSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Choose your vibe</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                        Personalize your shopping experience with our curated themes.
                    </Text>
                </View>

                {themes.map((theme) => (
                    <ThemeCard key={theme.id} theme={theme} />
                ))}

                <View style={[styles.previewSection, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>Quick Preview</Text>
                    <View style={styles.previewBox}>
                        <LinearGradient
                            colors={isDark ? ['#1A0B2E', '#0D0B1E'] : ['#F8F9FA', '#FFFFFF']}
                            style={styles.mockScreen}
                        >
                            <View style={[styles.mockNavbar, { backgroundColor: isDark ? '#2E2850' : '#E9ECEF' }]} />
                            <View style={styles.mockContent}>
                                <View style={[styles.mockCard, { backgroundColor: colors.cardAlt }]} />
                                <View style={[styles.mockLine, { backgroundColor: colors.border, width: '70%' }]} />
                                <View style={[styles.mockLine, { backgroundColor: colors.border, width: '40%' }]} />
                            </View>
                            <View style={[styles.mockButton, { backgroundColor: colors.accent }]} />
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, height: 60,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    
    content: { padding: 20 },
    introSection: { marginBottom: 24, marginTop: 10 },
    sectionTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    sectionSubtitle: { fontSize: 15, lineHeight: 22 },

    themeCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderRadius: 20, marginBottom: 16,
        borderWidth: 2, borderColor: 'transparent',
    },
    themeIcon: {
        width: 54, height: 54, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    themeInfo: { flex: 1, marginLeft: 16 },
    themeName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
    themeDescription: { fontSize: 13, lineHeight: 18 },
    
    previewStack: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    colorBubble: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#fff' },
    
    checkBadge: {
        position: 'absolute', top: -10, right: -10,
        width: 24, height: 24, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },

    previewSection: { marginTop: 20, padding: 20, borderRadius: 24 },
    previewTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
    previewBox: {
        width: '100%', height: 200, 
        alignItems: 'center', justifyContent: 'center',
    },
    mockScreen: {
        width: 120, height: 180, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
        padding: 10, overflow: 'hidden',
    },
    mockNavbar: { height: 12, borderRadius: 4, marginBottom: 10 },
    mockContent: { flex: 1, gap: 6 },
    mockCard: { height: 50, borderRadius: 8 },
    mockLine: { height: 6, borderRadius: 3 },
    mockButton: { height: 16, borderRadius: 4, marginTop: 10 },
});

export default ThemeSettingsScreen;
