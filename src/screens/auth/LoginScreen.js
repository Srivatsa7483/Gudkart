import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { colors, gradients } = useTheme();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        // ─────────────────────────────────────────────────────────────────────
        // NOTE: Using isTest: true because Firebase client SDK is not yet set up.
        // Once Firebase is integrated, replace this with:
        //   const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        //   const idToken = await userCredential.user.getIdToken();
        //   const loginPayload = { idToken };
        // ─────────────────────────────────────────────────────────────────────
        const loginPayload = {
            isTest: true,
            email: email,
        };

        console.log('📤 [LoginScreen] → POST /auth/login');
        console.log('📤 [LoginScreen] Payload:', JSON.stringify(loginPayload, null, 2));

        const result = await login(loginPayload);
        setIsLoading(false);

        console.log('📥 [LoginScreen] ← Response from /auth/login:');
        console.log('📥 [LoginScreen]', JSON.stringify(result, null, 2));

        if (result.success) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.getParent()?.replace('Main') ?? navigation.replace('Main');
            }
        } else {
            Alert.alert('Error', result.error || 'Invalid email or password');
        }
    };

    const handleGoogleLogin = () => Alert.alert('Google Login', 'Google login will be implemented');
    const handleAppleLogin = () => Alert.alert('Apple Login', 'Apple login will be implemented');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={gradients.background} style={styles.gradient}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Logo */}
                            <View style={styles.logoContainer}>
                                <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.logoText, { color: colors.background }]}>G</Text>
                                </View>
                                <Text style={[styles.brandName, { color: colors.textPrimary }]}>
                                    Gud<Text style={{ color: colors.accent }}>kart</Text>
                                </Text>
                                <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Trusted Marketplace</Text>
                            </View>

                            {/* Welcome */}
                            <View style={styles.welcomeContainer}>
                                <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>Welcome Back!</Text>
                                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>Login to continue shopping</Text>
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Email Address"
                                        placeholderTextColor={colors.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Password"
                                        placeholderTextColor={colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.forgotPasswordContainer}>
                                    <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>Forgot Password?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                                    <LinearGradient
                                        colors={gradients.accentButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginButtonGradient}
                                    >
                                        <Text style={[styles.loginButtonText, { color: '#0D0B1E' }]}>
                                            {isLoading ? 'Loading...' : 'Login'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                </View>

                                <View style={styles.socialContainer}>
                                    <TouchableOpacity
                                        style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={handleGoogleLogin}
                                    >
                                        <Ionicons name="logo-google" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={handleAppleLogin}
                                    >
                                        <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.signupContainer}>
                                    <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={[styles.signupLink, { color: colors.accent }]}>Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.demoContainer, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
                                <Text style={[styles.demoText, { color: colors.accent }]}>Demo Credentials:</Text>
                                <Text style={[styles.demoCredentials, { color: colors.textSecondary }]}>Email: test@sellsathi.com</Text>
                                <Text style={[styles.demoCredentials, { color: colors.textSecondary }]}>Password: password</Text>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    logoText: { fontSize: 40, fontWeight: 'bold' },
    brandName: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    tagline: { fontSize: 14 },
    welcomeContainer: { marginBottom: 32 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    welcomeSubtext: { fontSize: 16 },
    formContainer: { flex: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 56, fontSize: 16 },
    eyeIcon: { padding: 8 },
    forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600' },
    loginButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
    loginButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    loginButtonText: { fontSize: 18, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 16, fontSize: 14 },
    socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
    socialButton: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    signupText: { fontSize: 16 },
    signupLink: { fontSize: 16, fontWeight: 'bold' },
    demoContainer: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1 },
    demoText: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
    demoCredentials: { fontSize: 13, marginVertical: 2 },
});

export default LoginScreen;