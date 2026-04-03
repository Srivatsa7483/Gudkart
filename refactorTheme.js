const fs = require('fs');
const path = require('path');

const files = [
    'src/screens/cart/CartScreen.js',
    'src/screens/cart/CheckoutScreen.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Add import useTheme
    if (!content.includes('useTheme')) {
        content = content.replace("import { Ionicons } from '@expo/vector-icons';", "import { Ionicons } from '@expo/vector-icons';\nimport useTheme from '../../hooks/useTheme';");
    }

    // Insert useTheme hook
    // Replace const CartScreen = ({ navigation }) => { with the hook and styles
    content = content.replace(/(const (CartScreen|CheckoutScreen) = \([^)]+\) => \{)/, `$1\n    const { colors, gradients, isDark } = useTheme();\n    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);`);

    // Rewrite gradients in TSX
    content = content.replace(/colors=\{\['#1A0B2E', '#2E1A47'\]\}/g, "colors={isDark ? ['#1A0B2E', '#2E1A47'] : [colors.background, colors.surface]}");
    content = content.replace(/colors=\{\['#2E1A47', '#1A0B2E'\]\}/g, "colors={isDark ? ['#2E1A47', '#1A0B2E'] : [colors.surface, colors.background]}");
    content = content.replace(/colors=\{\['#FFD700', '#FFA500'\]\}/g, "colors={gradients.button}");
    
    // Replace hex colors in other TSX places directly if they exist
    content = content.replace(/color="#fff"/g, "color={colors.textPrimary}");
    content = content.replace(/color="#1A0B2E"/g, "color={isDark ? '#1A0B2E' : '#fff'}");
    content = content.replace(/color="#8E8EA9"/g, "color={colors.textMuted}");
    content = content.replace(/color="#00D9FF"/g, "color={colors.info || '#00D9FF'}");
    content = content.replace(/color="#FFD700"/g, "color={colors.accent}");
    content = content.replace(/color="#00D97E"/g, "color={colors.success}");
    content = content.replace(/color="#FF4757"/g, "color={colors.error || '#FF4757'}");
    content = content.replace(/color="#3D2458"/g, "color={colors.border}");

    // Convert StyleSheet.create into a function
    content = content.replace(/const styles = StyleSheet\.create\(\{/, 'const getStyles = (colors, isDark) => StyleSheet.create({');

    // Replace hex in StyleSheet
    content = content.replace(/backgroundColor: '#1A0B2E'/g, "backgroundColor: colors.background");
    content = content.replace(/backgroundColor: '#2E1A47'/g, "backgroundColor: colors.surface");
    content = content.replace(/backgroundColor: '#3D2458'/g, "backgroundColor: colors.cardAlt");
    content = content.replace(/borderColor: '#3D2458'/g, "borderColor: colors.border");
    content = content.replace(/borderColor: '#4E3569'/g, "borderColor: colors.border");
    content = content.replace(/color: '#fff'/g, "color: colors.textPrimary");
    content = content.replace(/color: '#8E8EA9'/g, "color: colors.textMuted");
    content = content.replace(/color: '#B8B8D1'/g, "color: colors.textSecondary");
    content = content.replace(/color: '#FFD700'/g, "color: colors.accent");
    content = content.replace(/borderColor: '#FFD700'/g, "borderColor: colors.accent");
    content = content.replace(/backgroundColor: '#FFD700'/g, "backgroundColor: colors.accent");
    content = content.replace(/color: '#1A0B2E'/g, "color: isDark ? '#1A0B2E' : '#fff'");
    content = content.replace(/color: '#00D97E'/g, "color: colors.success");
    content = content.replace(/backgroundColor: 'rgba\(0, 217, 255, 0\.1\)'/g, "backgroundColor: isDark ? 'rgba(0, 217, 255, 0.1)' : 'rgba(0, 217, 255, 0.05)'");

    fs.writeFileSync(fullPath, content, 'utf8');
});
