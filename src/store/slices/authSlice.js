// ─── src/store/slices/authSlice.js ─────────────────────────────────────────
//
// Redux mirror of AuthContext.
//
// AuthContext is the PRIMARY source of truth — it owns AsyncStorage, handles
// API calls, and exposes hooks.  This slice exists so screens/components that
// already use useSelector (e.g. AppNavigator deciding which stack to show) can
// subscribe to auth state reactively without prop-drilling.
//
// ── Exposed selectors ──────────────────────────────────────────────────────
//   selectUid         (state) => state.auth.uid
//   selectUser        (state) => state.auth.user
//   selectToken       (state) => state.auth.token
//   selectIsLoggedIn  (state) => state.auth.isLoggedIn
//
// ── Exposed actions ────────────────────────────────────────────────────────
//   setCredentials({ token, user })   — called by AuthContext after login/register
//   clearCredentials()                — called by AuthContext after logout
//
// ──────────────────────────────────────────────────────────────────────────

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    uid: null,   // string | null
    user: null,   // full user profile object | null
    token: null,   // JWT string | null
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Called by AuthContext once login / register / session-restore succeeds.
         * payload: { token: string, user: object }
         */
        setCredentials: (state, action) => {
            const { token, user } = action.payload;
            const uid = user?.uid ?? user?._id ?? user?.id ?? null;

            state.token = token;
            state.user = user;
            state.uid = uid;
            state.isLoggedIn = !!(uid && token);
        },

        /**
         * Called by AuthContext on logout.
         */
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
            state.uid = null;
            state.isLoggedIn = false;
        },

        /**
         * Merge-patch the user object in Redux.
         * Called by AuthContext.updateUser so selectors stay in sync.
         * payload: Partial<user>
         */
        patchUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { setCredentials, clearCredentials, patchUser } = authSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────────────
export const selectUid = (state) => state.auth.uid;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export default authSlice.reducer;