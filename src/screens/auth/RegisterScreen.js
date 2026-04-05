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

const RegisterScreen = ({ navigation }) => {
    const { colors, gradients } = useTheme();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

    const handleRegister = async () => {
        const { fullName, email, phone, password, confirmPassword } = formData;
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            return Alert.alert('Error', 'Please fill in all fields');
        }
        if (fullName.length < 2) return Alert.alert('Error', 'Please enter a valid name');
        if (!validateEmail(email)) return Alert.alert('Error', 'Please enter a valid email address');
        if (!validatePhone(phone)) return Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
        if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
        if (!agreedToTerms) return Alert.alert('Error', 'Please agree to Terms & Conditions');

        setIsLoading(true);

        // ─────────────────────────────────────────────────────────────────────
        // NOTE: Using isTest: true because Firebase client SDK is not yet set up.
        // Once Firebase is integrated, replace this block with:
        //   const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        //   const idToken = await userCredential.user.getIdToken();
        //   const registerPayload = { idToken, fullName, phone: `+91${phone}`, email };
        // ─────────────────────────────────────────────────────────────────────
        const registerPayload = {
            isTest: true,
            fullName: formData.fullName,
            email: formData.email,
            phone: `+91${formData.phone}`,   // add country code
            password: formData.password,
            // dob: formData.dob,             // add if you collect date of birth
        };

        console.log('📤 [RegisterScreen] → POST /auth/register');
        console.log('📤 [RegisterScreen] Payload:', JSON.stringify(registerPayload, null, 2));

        const result = await register(registerPayload);
        setIsLoading(false);

        console.log('📥 [RegisterScreen] ← Response from /auth/register:');
        console.log('📥 [RegisterScreen]', JSON.stringify(result, null, 2));

        if (result.success) {
            Alert.alert('Success', 'Registration successful!', [
                {
                    text: 'OK',
                    onPress: () => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.getParent()?.replace('Main') ?? navigation.replace('Main');
                        }
                    }
                }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Registration failed');
        }
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient colors={gradients.background} style={styles.gradient}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity
                                    style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            {/* Logo */}
                            <View style={styles.logoContainer}>
                                <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.logoText, { color: colors.background }]}>G</Text>
                                </View>
                                <Text style={[styles.brandName, { color: colors.textPrimary }]}>
                                    Gud<Text style={{ color: colors.accent }}>kart</Text>
                                </Text>
                            </View>

                            {/* Welcome Text */}
                            <View style={styles.welcomeContainer}>
                                <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>Create Account</Text>
                                <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                                    Sign up to start shopping
                                </Text>
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>
                                {/* Full Name */}
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Full Name"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.fullName}
                                        onChangeText={(value) => updateFormData('fullName', value)}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {/* Email */}
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Email Address"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.email}
                                        onChangeText={(value) => updateFormData('email', value)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                {/* Phone */}
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Phone Number (10 digits)"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.phone}
                                        onChangeText={(value) => updateFormData('phone', value)}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>

                                {/* Password */}
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Password"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.password}
                                        onChangeText={(value) => updateFormData('password', value)}
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

                                {/* Confirm Password */}
                                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textPrimary }]}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={colors.textMuted}
                                        value={formData.confirmPassword}
                                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Password Requirements */}
                                <View style={styles.requirementsContainer}>
                                    <Text style={[styles.requirementsTitle, { color: colors.textSecondary }]}>Password must contain:</Text>
                                    <View style={styles.requirementRow}>
                                        <Ionicons
                                            name={formData.password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={formData.password.length >= 8 ? colors.success : colors.textMuted}
                                        />
                                        <Text style={[styles.requirementText, { color: colors.textMuted }]}>At least 8 characters</Text>
                                    </View>
                                </View>

                                {/* Terms Checkbox */}
                                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreedToTerms(!agreedToTerms)}>
                                    <View style={[styles.checkbox, { borderColor: colors.border }, agreedToTerms && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                                        {agreedToTerms && <Ionicons name="checkmark" size={16} color={colors.background} />}
                                    </View>
                                    <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>
                                        I agree to{' '}
                                        <Text style={[styles.linkText, { color: colors.accent }]}>Terms & Conditions</Text>
                                        {' '}and{' '}
                                        <Text style={[styles.linkText, { color: colors.accent }]}>Privacy Policy</Text>
                                    </Text>
                                </TouchableOpacity>

                                {/* Register Button */}
                                <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
                                    <LinearGradient
                                        colors={gradients.accentButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.registerButtonGradient}
                                    >
                                        <Text style={[styles.registerButtonText, { color: '#0D0B1E' }]}>
                                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                </View>

                                <View style={styles.socialContainer}>
                                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Ionicons name="logo-google" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.loginContainer}>
                                    <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={[styles.loginLink, { color: colors.accent }]}>Login</Text>
                                    </TouchableOpacity>
                                </View>
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
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    header: { paddingTop: 20, marginBottom: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    logoText: { fontSize: 36, fontWeight: 'bold' },
    brandName: { fontSize: 28, fontWeight: 'bold' },
    welcomeContainer: { marginBottom: 24 },
    welcomeText: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    welcomeSubtext: { fontSize: 16 },
    formContainer: { flex: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 56, fontSize: 16 },
    eyeIcon: { padding: 8 },
    requirementsContainer: { marginBottom: 20, paddingHorizontal: 4 },
    requirementsTitle: { fontSize: 13, marginBottom: 8 },
    requirementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    requirementText: { fontSize: 13, marginLeft: 8 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    checkboxText: { fontSize: 14, flex: 1 },
    linkText: { fontWeight: '600' },
    registerButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
    registerButtonGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    registerButtonText: { fontSize: 18, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 16, fontSize: 14 },
    socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 },
    socialButton: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    loginText: { fontSize: 16 },
    loginLink: { fontSize: 16, fontWeight: 'bold' },
});

export default RegisterScreen;