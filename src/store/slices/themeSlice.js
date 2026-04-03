// ─── Theme Slice ───────────────────────────────────────────────────────────

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    mode: 'dark', // 'dark' | 'light'
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
        },
        setTheme: (state, action) => {
            state.mode = action.payload; // 'dark' or 'light'
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;