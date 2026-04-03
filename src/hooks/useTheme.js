// ─── useTheme Hook ─────────────────────────────────────────────────────────

import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';
import darkTheme from '../theme/darkTheme';
import lightTheme from '../theme/lightTheme';

const useTheme = () => {
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.theme.mode);

    const theme = mode === 'dark' ? darkTheme : lightTheme;
    const isDark = mode === 'dark';

    const toggle = () => dispatch(toggleTheme());
    const setMode = (m) => dispatch(setTheme(m));

    return {
        theme,
        isDark,
        colors: theme.colors,
        gradients: theme.gradients,
        spacing: theme.spacing,
        borderRadius: theme.borderRadius,
        shadow: theme.shadow,
        layout: theme.layout,
        typography: theme.typography,
        toggle,
        setMode,
    };
};

export default useTheme;