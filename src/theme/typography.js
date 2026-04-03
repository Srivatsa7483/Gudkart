// ─── SellSathi Typography ──────────────────────────────────────────────────

import { Platform } from 'react-native';

export const fontFamily = {
    // Use system fonts as base (replace with custom fonts if added)
    regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    semiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' }),
    black: Platform.select({ ios: 'System', android: 'sans-serif-black' }),
};

export const fontSize = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
};

export const lineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
};

export const fontWeight = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
};

// Reusable text style presets
export const textStyles = {
    // Headings
    h1: { fontSize: fontSize['4xl'], fontWeight: fontWeight.black, lineHeight: fontSize['4xl'] * 1.2 },
    h2: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['3xl'] * 1.2 },
    h3: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['2xl'] * 1.3 },
    h4: { fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, lineHeight: fontSize.xl * 1.4 },
    h5: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, lineHeight: fontSize.lg * 1.4 },

    // Body
    bodyLarge: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: fontSize.md * 1.6 },
    body: { fontSize: fontSize.base, fontWeight: fontWeight.regular, lineHeight: fontSize.base * 1.6 },
    bodySmall: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: fontSize.sm * 1.5 },

    // Labels / UI
    label: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
    labelSmall: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular },

    // Special
    price: { fontSize: fontSize['2xl'], fontWeight: fontWeight.black },
    badge: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
    button: { fontSize: fontSize.base, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
};