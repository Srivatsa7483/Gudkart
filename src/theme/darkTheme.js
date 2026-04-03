// ─── SellSathi Dark Theme ──────────────────────────────────────────────────

import { darkColors } from './colors';
import { textStyles, fontFamily, fontSize, fontWeight } from './typography';
import { spacing, borderRadius, shadow, layout } from './spacing';

const darkTheme = {
    dark: true,
    colors: darkColors,
    typography: { textStyles, fontFamily, fontSize, fontWeight },
    spacing,
    borderRadius,
    shadow: shadow.dark,
    layout,

    // Gradient presets for LinearGradient
    gradients: {
        background: ['#0D0B1E', '#16132E'],
        card: ['#1E1A38', '#231F42'],
        primary: ['#7B5EEA', '#5A3EC8'],
        accent: ['#FFD700', '#FFA500'],
        deal: ['#2D1B69', '#1E1A38'],
        splash: ['#0D0B1E', '#1A1440', '#0D0B1E'],
        logo: ['#FFD700', '#9B82F3'],
        button: ['#7B5EEA', '#5A3EC8'],
        accentButton: ['#FFD700', '#FFA500'],
        header: ['#0D0B1E', '#1A1440'],
    },
};

export default darkTheme;