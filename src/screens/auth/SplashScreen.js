// ─── Gudkart Splash Screen ───────────────────────────────────────────────────
//
// Animated sequence:
//  0ms  → Background gradient fades in
//  400ms → Logo appears with scale & glow
//  800ms → Shopping items burst out from logo (cart, bag, tag, gift, heart, star)
//  1200ms → "Gudkart" wordmark slides up
//  1600ms → Tagline fades in
//  2200ms → Gold shimmer sweeps
//  3000ms → Everything fades out → navigate
//
// ──────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    Image,
    Animated,
    StyleSheet,
    Dimensions,
    StatusBar,
    Easing,
} from 'react-native';
import { LinearGradient } from '../../components/SafeLinearGradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ── Shopping Item Component ─────────────────────────────────────────────────
const ShoppingItem = ({ icon, color, delay, angle, distance }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                // Pop in
                Animated.spring(scale, {
                    toValue: 1,
                    tension: 50,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
            // Fly out
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: Math.cos(angle) * distance,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: Math.sin(angle) * distance,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                // Fade out while flying
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 600,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const rotation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.shoppingItem,
                {
                    opacity,
                    transform: [
                        { scale },
                        { translateX },
                        { translateY },
                        { rotate: rotation },
                    ],
                },
            ]}
        >
            <View style={[styles.itemCircle, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
        </Animated.View>
    );
};

// ── Sparkle Particle ────────────────────────────────────────────────────────
const Sparkle = ({ delay, x, y, size }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.spring(scale, {
                        toValue: 1,
                        tension: 40,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.8,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                opacity,
                transform: [{ scale }],
            }}
        >
            <Ionicons name="sparkles" size={size} color="#FFD700" />
        </Animated.View>
    );
};

// ── Shopping Items Config ──────────────────────────────────────────────────
const SHOPPING_ITEMS = [
    { id: 1, icon: 'cart', color: '#FFD700', angle: -Math.PI / 4, distance: 120, delay: 0 },
    { id: 2, icon: 'bag-handle', color: '#FF6B6B', angle: -Math.PI * 3 / 4, distance: 110, delay: 100 },
    { id: 3, icon: 'pricetag', color: '#00D9FF', angle: Math.PI / 4, distance: 130, delay: 200 },
    { id: 4, icon: 'gift', color: '#FF4757', angle: Math.PI * 3 / 4, distance: 115, delay: 150 },
    { id: 5, icon: 'heart', color: '#FF6B9D', angle: -Math.PI / 2, distance: 125, delay: 50 },
    { id: 6, icon: 'star', color: '#FFD700', angle: 0, distance: 135, delay: 250 },
    { id: 7, icon: 'cube', color: '#00D97E', angle: Math.PI, distance: 118, delay: 180 },
    { id: 8, icon: 'card', color: '#7B5EEA', angle: Math.PI / 2, distance: 122, delay: 220 },
];

// ── Sparkles Config ────────────────────────────────────────────────────────
const SPARKLES = [
    { id: 1, x: width * 0.15, y: height * 0.20, size: 20, delay: 0 },
    { id: 2, x: width * 0.85, y: height * 0.25, size: 24, delay: 400 },
    { id: 3, x: width * 0.10, y: height * 0.70, size: 18, delay: 800 },
    { id: 4, x: width * 0.90, y: height * 0.65, size: 22, delay: 600 },
    { id: 5, x: width * 0.50, y: height * 0.15, size: 20, delay: 200 },
    { id: 6, x: width * 0.25, y: height * 0.80, size: 18, delay: 1000 },
];

// ── Main Splash Screen ─────────────────────────────────────────────────────
const SplashScreen = ({ navigation }) => {
    // Animation refs
    const bgOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(0.5)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;
    const wordmarkY = useRef(new Animated.Value(30)).current;
    const wordmarkOp = useRef(new Animated.Value(0)).current;
    const taglineOp = useRef(new Animated.Value(0)).current;
    const shimmerX = useRef(new Animated.Value(-width)).current;
    const exitOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const sequence = Animated.sequence([
            // 1. Background fades in
            Animated.timing(bgOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            // 2. Glow appears
            Animated.parallel([
                Animated.spring(glowScale, {
                    toValue: 1,
                    tension: 30,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.4,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

            // 3. Logo pops in
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 40,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),

            // 4. Wait for items to burst out
            Animated.delay(1000),

            // 5. Wordmark slides up
            Animated.parallel([
                Animated.spring(wordmarkY, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(wordmarkOp, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

            // 6. Tagline fades in
            Animated.delay(200),
            Animated.timing(taglineOp, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),

            // 7. Shimmer effect
            Animated.delay(300),
            Animated.timing(shimmerX, {
                toValue: width * 2,
                duration: 800,
                useNativeDriver: true,
            }),

            // 8. Hold
            Animated.delay(400),

            // 9. Fade out
            Animated.timing(exitOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]);

        // Continuous ring rotation
        Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        sequence.start(async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    // First launch — show onboarding
                    navigation?.replace('Auth');
                } else {
                    // Returning user — skip onboarding, go straight to app
                    navigation?.replace('Main');
                }
            } catch (_) {
                // Fallback: always go to Auth on error
                navigation?.replace('Auth');
            }
        });
    }, []);

    const ringRotation = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Background gradient */}
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}>
                <LinearGradient
                    colors={['#0D0618', '#1A0B2E', '#2E1A47', '#1A0B2E']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Sparkles */}
            {SPARKLES.map((sparkle) => (
                <Sparkle key={sparkle.id} {...sparkle} />
            ))}

            {/* Radial glow behind logo */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />

            {/* Main content */}
            <Animated.View style={[styles.content, { opacity: exitOpacity }]}>
                {/* Logo Section */}
                <View style={styles.logoWrapper}>
                    {/* Rotating decorative rings */}
                    <Animated.View
                        style={[
                            styles.rotatingRing,
                            { transform: [{ rotate: ringRotation }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#FFD700', 'transparent', '#7B5EEA', 'transparent']}
                            style={styles.ringGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>

                    {/* Logo circle */}
                    <Animated.View
                        style={[
                            styles.logoCircle,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#2E1A47', '#1A0B2E']}
                            style={styles.logoGradient}
                        >
                            {/* Logo image in centered circle */}
                            <View style={styles.innerLogoCircle}>
                                <Image
                                    source={require('../../assets/icons/logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Shopping items burst out from center */}
                            {SHOPPING_ITEMS.map((item) => (
                                <ShoppingItem key={item.id} {...item} />
                            ))}
                        </LinearGradient>
                    </Animated.View>

                    {/* Pulse ring effect */}
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            {
                                opacity: logoOpacity,
                                transform: [{ scale: logoScale }],
                            },
                        ]}
                    />
                </View>

                {/* Wordmark */}
                <Animated.View
                    style={[
                        styles.wordmarkWrapper,
                        {
                            opacity: wordmarkOp,
                            transform: [{ translateY: wordmarkY }],
                        },
                    ]}
                >
                    <Text style={styles.wordmark}>
                        <Text style={styles.wordmarkGud}>Gud</Text>
                        <Text style={styles.wordmarkKart}>kart</Text>
                    </Text>

                    {/* Shimmer overlay */}
                    <Animated.View
                        style={[
                            styles.shimmer,
                            { transform: [{ translateX: shimmerX }] },
                        ]}
                        pointerEvents="none"
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(255,215,0,0.6)', 'transparent']}
                            style={styles.shimmerGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </Animated.View>
                </Animated.View>

                {/* Tagline */}
                <Animated.Text style={[styles.tagline, { opacity: taglineOp }]}>
                    Your Trusted Marketplace
                </Animated.Text>

                {/* Decorative dots */}
                <Animated.View style={[styles.dots, { opacity: taglineOp }]}>
                    <View style={[styles.dot, { backgroundColor: '#7B5EEA' }]} />
                    <View style={[styles.dot, { backgroundColor: '#FFD700', width: 16 }]} />
                    <View style={[styles.dot, { backgroundColor: '#7B5EEA' }]} />
                </Animated.View>
            </Animated.View>

            {/* Bottom brand */}
            <Animated.View style={[styles.bottomStrip, { opacity: exitOpacity }]}>
                <View style={styles.brandRow}>
                    <Ionicons name="storefront" size={16} color="#FFD700" />
                    <Text style={styles.bottomText}>  Gudkart © 2026</Text>
                </View>
            </Animated.View>
        </View>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const LOGO_SIZE = 180;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0618',
    },

    glow: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: '#7B5EEA',
        top: height * 0.5 - width * 0.4,
        left: width * 0.1,
        shadowColor: '#7B5EEA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 100,
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Logo
    logoWrapper: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },

    rotatingRing: {
        position: 'absolute',
        width: LOGO_SIZE + 30,
        height: LOGO_SIZE + 30,
        borderRadius: (LOGO_SIZE + 30) / 2,
        padding: 3,
    },

    ringGradient: {
        width: '100%',
        height: '100%',
        borderRadius: (LOGO_SIZE + 30) / 2,
    },

    logoCircle: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: LOGO_SIZE / 2,
        overflow: 'visible', // Allow items to fly out
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 25,
        elevation: 20,
    },

    logoGradient: {
        width: '100%',
        height: '100%',
        borderRadius: LOGO_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    lettermark: {
        fontSize: 68,
        fontWeight: '900',
        color: '#FFD700',
        letterSpacing: -1,
        textShadowColor: 'rgba(255, 215, 0, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },

    logoImage: {
        width: LOGO_SIZE * 0.9,
        height: LOGO_SIZE * 0.9,
    },

    innerLogoCircle: {
        width: LOGO_SIZE * 0.95,
        height: LOGO_SIZE * 0.95,
        borderRadius: (LOGO_SIZE * 0.95) / 2,
        borderWidth: 2,
        borderColor: '#FFD70040',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseRing: {
        position: 'absolute',
        width: LOGO_SIZE + 20,
        height: LOGO_SIZE + 20,
        borderRadius: (LOGO_SIZE + 20) / 2,
        borderWidth: 2,
        borderColor: '#FFD70040',
    },

    // Shopping Items
    shoppingItem: {
        position: 'absolute',
        top: LOGO_SIZE / 2 - 24,
        left: LOGO_SIZE / 2 - 24,
    },

    itemCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Wordmark
    wordmarkWrapper: {
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },

    wordmark: {
        letterSpacing: -1,
    },

    wordmarkGud: {
        fontSize: 56,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },

    wordmarkKart: {
        fontSize: 56,
        fontWeight: '900',
        color: '#FFD700',
        letterSpacing: -1,
        textShadowColor: 'rgba(255, 215, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },

    shimmer: {
        position: 'absolute',
        top: 0,
        left: -60,
        width: 60,
        height: '100%',
    },

    shimmerGradient: {
        width: '100%',
        height: '100%',
    },

    // Tagline
    tagline: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B8B8D1',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 20,
    },

    // Dots
    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    // Bottom
    bottomStrip: {
        paddingBottom: 32,
        alignItems: 'center',
    },

    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    bottomText: {
        fontSize: 12,
        color: '#8E8EA9',
        letterSpacing: 0.5,
    },
});

export default SplashScreen;