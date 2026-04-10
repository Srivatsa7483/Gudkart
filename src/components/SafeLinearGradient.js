// ─── SafeLinearGradient ─────────────────────────────────────────────────────
// Drop-in replacement for expo-linear-gradient's LinearGradient.
// Validates the `colors` array so Android never receives null/undefined values,
// which crash the native LinearGradientView with:
//   "null cannot be cast to non-null type kotlin.Double"
//
// Usage: just change your import from
//   import { LinearGradient } from 'expo-linear-gradient';
// to
//   import { LinearGradient } from '../components/SafeLinearGradient';
// ────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const FALLBACK_COLORS = ['#7B5EEA', '#5A3EC8'];

function sanitizeColors(colors) {
    // Must be a non-empty array
    if (!Array.isArray(colors) || colors.length === 0) {
        return FALLBACK_COLORS;
    }

    // Check every element is a valid string (not null, undefined, or empty)
    for (let i = 0; i < colors.length; i++) {
        if (typeof colors[i] !== 'string' || colors[i].length === 0) {
            return FALLBACK_COLORS;
        }
    }

    // Need at least 2 colors
    if (colors.length === 1) {
        return [colors[0], colors[0]];
    }

    return colors;
}

export const LinearGradient = React.forwardRef((props, ref) => {
    const safeColors = sanitizeColors(props.colors);
    return <ExpoLinearGradient {...props} colors={safeColors} ref={ref} />;
});

LinearGradient.displayName = 'SafeLinearGradient';

export default LinearGradient;
