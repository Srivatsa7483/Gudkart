// ─── src/screens/auth/LoginScreen.js ───────────────────────────────────────
//
// Connected to the central AuthContext.
// After a successful login the context automatically:
//   • stores uid / user / token in AsyncStorage
//   • updates Redux (authSlice)
//   • makes uid available app-wide via useAuth()
//
// No uid passing via route.params is required anywhere.
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';

// ── Central auth hook — the ONLY import needed for auth state ──────────────
import { useAuth } from '../../context/AuthContext';

// ─── Firebase Client SDK ────────────────────────────────────────────────────
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    GoogleAuthProvider,
    signInWithCredential,
    OAuthProvider,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as Apple from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Firebase is initialised once for the whole app; guard against double-init.
const firebaseConfig = {
    apiKey: 'AIzaSyAgz9OL6NYOxwxpzgz7e6Y1Zk6861Gpvt0',
    authDomain: 'sellsathi-94ede.firebaseapp.com',
    projectId: 'sellsathi-94ede',
    storageBucket: 'sellsathi-94ede.firebasestorage.app',
    messagingSenderId: '213392011043',
    appId: '1:213392011043:web:669298ae968e8af8a6a696',
    measurementId: 'G-TRNXGBX0HL',
};

if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    console.log('🔥 [LoginScreen] Firebase initialized');
}
// ────────────────────────────────────────────────────────────────────────────

const LoginScreen = ({ navigation }) => {
    const { colors, gradients } = useTheme();

    // ── Pull login action from the central context ──────────────────────────
    // uid, user, token are set automatically inside AuthContext.login()
    const { login } = useAuth();

    // ── Local UI state ──────────────────────────────────────────────────────
    const [authMethod, setAuthMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const recaptchaVerifierRef = useRef(null);

    // Google OAuth session
    const [, , promptGoogleAsync] = Google.useAuthRequest({
        androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
        webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

    // ── Helpers ─────────────────────────────────────────────────────────────
    const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const firebaseErrorMap = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/invalid-verification-code': 'Invalid OTP. Please try again.',
        'auth/code-expired': 'OTP has expired. Please resend.',
        'auth/invalid-phone-number': 'Invalid phone number.',
    };

    const getFriendlyError = (code, fallback) =>
        firebaseErrorMap[code] || fallback || 'Something went wrong.';

    // ── Core: Firebase → backend → AuthContext ──────────────────────────────
    /**
     * After Firebase auth succeeds, hand the idToken off to AuthContext.login().
     * AuthContext handles storing uid / user / token everywhere automatically.
     */
    const handleBackendLogin = async (userCredential, extraPayload = {}) => {
        const firebaseUser = userCredential.user;
        console.log('✅ [LoginScreen] Firebase auth OK — UID:', firebaseUser.uid);

        const idToken = await firebaseUser.getIdToken();
        console.log('✅ [LoginScreen] idToken (first 60):', idToken.substring(0, 60) + '...');

        const payload = {
            idToken,
            isTest: false,
            email: firebaseUser.email || extraPayload.email || null,
            phone: firebaseUser.phoneNumber || extraPayload.phone || null,
        };

        console.log('📤 [LoginScreen] → AuthContext.login()');

        // AuthContext.login() calls POST /auth/login,
        // then sets uid / user / token in context + Redux + AsyncStorage.
        const result = await login(payload);

        console.log('📥 [LoginScreen] AuthContext.login() result:', JSON.stringify(result));
        return result;
    };

    const navigateAfterLogin = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.getParent()?.replace('Main') ?? navigation.replace('Main');
        }
    };

    // ── 1. Email + Password ─────────────────────────────────────────────────
    const handleEmailLogin = async () => {
        if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
        if (!validateEmail(email)) return Alert.alert('Error', 'Please enter a valid email address');
        if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

        setIsLoading(true);
        try {
            console.log('🔥 [LoginScreen] [EMAIL] Signing in...');
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const result = await handleBackendLogin(userCredential, { email });
            setIsLoading(false);
            if (result.success) navigateAfterLogin();
            else Alert.alert('Error', result.error || 'Invalid email or password');
        } catch (err) {
            setIsLoading(false);
            console.error('❌ [LoginScreen] [EMAIL]', err.code, err.message);
            Alert.alert('Login Failed', getFriendlyError(err.code, err.message));
        }
    };

    // ── 2. Phone — Send OTP ─────────────────────────────────────────────────
    const handleSendOTP = async () => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10) return Alert.alert('Error', 'Please enter a valid 10-digit phone number');

        setIsLoading(true);
        try {
            console.log('🔥 [LoginScreen] [PHONE] Sending OTP to +91' + cleaned);
            const auth = getAuth();

            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
            }

            const confirmation = await signInWithPhoneNumber(auth, `+91${cleaned}`, recaptchaVerifierRef.current);
            setConfirmationResult(confirmation);
            setOtpStep(true);
            setIsLoading(false);
            console.log('✅ [LoginScreen] [PHONE] OTP sent');
            Alert.alert('OTP Sent', `A 6-digit OTP has been sent to +91${cleaned}`);
        } catch (err) {
            setIsLoading(false);
            console.error('❌ [LoginScreen] [PHONE] Send OTP:', err.code, err.message);
            Alert.alert('Error', getFriendlyError(err.code, err.message));
        }
    };

    // ── 3. Phone — Verify OTP ───────────────────────────────────────────────
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) return Alert.alert('Error', 'Please enter the 6-digit OTP');
        if (!confirmationResult) return Alert.alert('Error', 'Please resend OTP first');

        setIsLoading(true);
        try {
            console.log('🔥 [LoginScreen] [PHONE] Verifying OTP...');
            const userCredential = await confirmationResult.confirm(otp);
            const result = await handleBackendLogin(userCredential, { phone: `+91${phone}` });
            setIsLoading(false);
            if (result.success) navigateAfterLogin();
            else Alert.alert('Error', result.error || 'Login failed');
        } catch (err) {
            setIsLoading(false);
            console.error('❌ [LoginScreen] [PHONE] Verify OTP:', err.code, err.message);
            Alert.alert('Error', getFriendlyError(err.code, err.message));
        }
    };

    // ── 4. Google ───────────────────────────────────────────────────────────
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            console.log('🔥 [LoginScreen] [GOOGLE] Prompting Google sign-in...');
            const response = await promptGoogleAsync();

            if (response?.type !== 'success') {
                setIsLoading(false);
                console.log('ℹ️ [LoginScreen] [GOOGLE] Cancelled');
                return;
            }

            const { id_token } = response.params;
            const auth = getAuth();
            const credential = GoogleAuthProvider.credential(id_token);
            const userCredential = await signInWithCredential(auth, credential);

            console.log('✅ [LoginScreen] [GOOGLE] Firebase sign-in OK');
            const result = await handleBackendLogin(userCredential);
            setIsLoading(false);
            if (result.success) navigateAfterLogin();
            else Alert.alert('Error', result.error || 'Google login failed');
        } catch (err) {
            setIsLoading(false);
            console.error('❌ [LoginScreen] [GOOGLE]', err.code, err.message);
            Alert.alert('Google Login Failed', getFriendlyError(err.code, err.message));
        }
    };

    // ── 5. Apple (iOS only) ─────────────────────────────────────────────────
    const handleAppleLogin = async () => {
        setIsLoading(true);
        try {
            console.log('🔥 [LoginScreen] [APPLE] Requesting Apple credentials...');
            const appleCredential = await Apple.signInAsync({
                requestedScopes: [
                    Apple.AppleAuthenticationScope.FULL_NAME,
                    Apple.AppleAuthenticationScope.EMAIL,
                ],
            });

            const { identityToken, nonce } = appleCredential;
            if (!identityToken) throw new Error('No identity token from Apple');

            const auth = getAuth();
            const provider = new OAuthProvider('apple.com');
            const credential = provider.credential({ idToken: identityToken, rawNonce: nonce });
            const userCredential = await signInWithCredential(auth, credential);

            console.log('✅ [LoginScreen] [APPLE] Firebase sign-in OK');
            const result = await handleBackendLogin(userCredential);
            setIsLoading(false);
            if (result.success) navigateAfterLogin();
            else Alert.alert('Error', result.error || 'Apple login failed');
        } catch (err) {
            setIsLoading(false);
            if (err.code === 'ERR_CANCELED') {
                console.log('ℹ️ [LoginScreen] [APPLE] User cancelled');
                return;
            }
            console.error('❌ [LoginScreen] [APPLE]', err.code, err.message);
            Alert.alert('Apple Login Failed', getFriendlyError(err.code, err.message));
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={gradients.background} style={styles.gradient}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                            {/* ── Logo ── */}
                            <View style={styles.logoContainer}>
                                <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.logoText, { color: colors.background }]}>G</Text>
                                </View>
                                <Text style={[styles.brandName, { color: colors.textPrimary }]}>
                                    Gud<Text style={{ color: colors.accent }}>kart</Text>
                                </Text>
                                <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Trusted Marketplace</Text>
                            </View>

                            {/* ── Welcome ── */}
                            <View style={styles.welcomeContainer}>
                                <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>Welcome Back!</Text>
                                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>Login to continue shopping</Text>
                            </View>

                            {/* ── Auth Method Toggle ── */}
                            <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, authMethod === 'email' && { backgroundColor: colors.accent }]}
                                    onPress={() => { setAuthMethod('email'); setOtpStep(false); }}
                                >
                                    <Ionicons name="mail-outline" size={16} color={authMethod === 'email' ? colors.background : colors.textSecondary} />
                                    <Text style={[styles.toggleText, { color: authMethod === 'email' ? colors.background : colors.textSecondary }]}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, authMethod === 'phone' && { backgroundColor: colors.accent }]}
                                    onPress={() => { setAuthMethod('phone'); setOtpStep(false); }}
                                >
                                    <Ionicons name="phone-portrait-outline" size={16} color={authMethod === 'phone' ? colors.background : colors.textSecondary} />
                                    <Text style={[styles.toggleText, { color: authMethod === 'phone' ? colors.background : colors.textSecondary }]}>Phone OTP</Text>
                                </TouchableOpacity>
                            </View>

                            {/* ── Email Form ── */}
                            {authMethod === 'email' && (
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
                                            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={styles.forgotPasswordContainer}>
                                        <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin} disabled={isLoading}>
                                        <LinearGradient colors={gradients.accentButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButtonGradient}>
                                            {isLoading
                                                ? <ActivityIndicator color={colors.background} />
                                                : <Text style={[styles.loginButtonText, { color: '#0D0B1E' }]}>Login</Text>
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* ── Phone Form ── */}
                            {authMethod === 'phone' && (
                                <View style={styles.formContainer}>
                                    {!otpStep ? (
                                        <>
                                            <View style={[styles.phoneContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                                <View style={[styles.phonePrefix, { borderColor: colors.border }]}>
                                                    <Text style={[styles.phonePrefixText, { color: colors.accent }]}>+91</Text>
                                                </View>
                                                <TextInput
                                                    style={[styles.phoneInput, { color: colors.textPrimary }]}
                                                    placeholder="Mobile Number"
                                                    placeholderTextColor={colors.textMuted}
                                                    value={phone}
                                                    onChangeText={(val) => setPhone(val.replace(/\D/g, '').slice(0, 10))}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.loginButton, phone.length < 10 && { opacity: 0.5 }]}
                                                onPress={handleSendOTP}
                                                disabled={isLoading || phone.length < 10}
                                            >
                                                <LinearGradient colors={gradients.accentButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButtonGradient}>
                                                    {isLoading
                                                        ? <ActivityIndicator color={colors.background} />
                                                        : <Text style={[styles.loginButtonText, { color: '#0D0B1E' }]}>Get OTP</Text>
                                                    }
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[styles.otpHint, { color: colors.textSecondary }]}>
                                                Enter the 6-digit OTP sent to +91{phone}
                                            </Text>

                                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                                <Ionicons name="keypad-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                                <TextInput
                                                    style={[styles.otpInput, { color: colors.textPrimary }]}
                                                    placeholder="0  0  0  0  0  0"
                                                    placeholderTextColor={colors.textMuted}
                                                    value={otp}
                                                    onChangeText={(val) => setOtp(val.replace(/\D/g, '').slice(0, 6))}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.loginButton, otp.length < 6 && { opacity: 0.5 }]}
                                                onPress={handleVerifyOTP}
                                                disabled={isLoading || otp.length < 6}
                                            >
                                                <LinearGradient colors={gradients.accentButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButtonGradient}>
                                                    {isLoading
                                                        ? <ActivityIndicator color={colors.background} />
                                                        : <Text style={[styles.loginButtonText, { color: '#0D0B1E' }]}>Verify & Login</Text>
                                                    }
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => { setOtpStep(false); setOtp(''); }} style={styles.backLink}>
                                                <Ionicons name="arrow-back-outline" size={16} color={colors.accent} />
                                                <Text style={[styles.backLinkText, { color: colors.accent }]}>Change Number</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}

                            {/* ── OR Divider ── */}
                            <View style={styles.dividerContainer}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            </View>

                            {/* ── Google ── */}
                            <TouchableOpacity
                                style={[styles.socialFullButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <Ionicons name="logo-google" size={20} color="#EA4335" />
                                <Text style={[styles.socialFullButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
                            </TouchableOpacity>

                            {/* ── Apple (iOS only) ── */}
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity
                                    style={[styles.socialFullButton, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}
                                    onPress={handleAppleLogin}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
                                    <Text style={[styles.socialFullButtonText, { color: colors.textPrimary }]}>Continue with Apple</Text>
                                </TouchableOpacity>
                            )}

                            {/* ── Sign Up Link ── */}
                            <View style={styles.signupContainer}>
                                <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={[styles.signupLink, { color: colors.accent }]}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>

            {/* Invisible recaptcha anchor for phone auth */}
            <View nativeID="recaptcha-container" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

    logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
    logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    logoText: { fontSize: 40, fontWeight: 'bold' },
    brandName: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    tagline: { fontSize: 14 },

    welcomeContainer: { marginBottom: 24 },
    welcomeText: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    welcomeSubtext: { fontSize: 16 },

    toggleContainer: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 24 },
    toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
    toggleText: { fontSize: 14, fontWeight: '600' },

    formContainer: { marginBottom: 4 },

    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 56, fontSize: 16 },
    eyeIcon: { padding: 8 },

    phoneContainer: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
    phonePrefix: { paddingHorizontal: 14, justifyContent: 'center', borderRightWidth: 1 },
    phonePrefixText: { fontSize: 15, fontWeight: '700' },
    phoneInput: { flex: 1, height: 56, paddingHorizontal: 14, fontSize: 16, fontWeight: '700' },

    otpHint: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
    otpInput: { flex: 1, height: 56, fontSize: 22, letterSpacing: 8, textAlign: 'center' },

    backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 },
    backLinkText: { fontSize: 14, fontWeight: '600' },

    forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { fontSize: 14, fontWeight: '600' },

    loginButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
    loginButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    loginButtonText: { fontSize: 18, fontWeight: 'bold' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 16, fontSize: 14 },

    socialFullButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 54, borderRadius: 12, borderWidth: 1 },
    socialFullButtonText: { fontSize: 15, fontWeight: '600' },

    signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    signupText: { fontSize: 16 },
    signupLink: { fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;