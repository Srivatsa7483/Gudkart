// ─── SellSathi Light Theme ─────────────────────────────────────────────────

import { lightColors } from './colors';
import { textStyles, fontFamily, fontSize, fontWeight } from './typography';
import { spacing, borderRadius, shadow, layout } from './spacing';

const lightTheme = {
    dark: false,
    colors: lightColors,
    typography: { textStyles, fontFamily, fontSize, fontWeight },
    spacing,
    borderRadius,
    shadow: shadow.light,
    layout,

    // Gradient presets for LinearGradient
    gradients: {
        background: ['#E8F4FD', '#F0F9FF'],
        card: ['#FFFFFF', '#F0F9FF'],
        primary: ['#38BDF8', '#0EA5E9'],
        accent: ['#FFD96B', '#FFD700'],
        deal: ['#BAE6FD', '#E0F2FE'],
        splash: ['#E8F4FD', '#BAE6FD', '#E8F4FD'],
        logo: ['#0EA5E9', '#FFD700'],
        button: ['#0EA5E9', '#0284C7'],
        accentButton: ['#FFD700', '#FFA500'],
        header: ['#FFFFFF', '#F8F9FA'],
    },
};

export default lightTheme;