// ─── Redux Store ───────────────────────────────────────────────────────────

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import themeReducer from './slices/themeSlice';
// Future slices:
// import authReducer from './slices/authSlice';
// import cartReducer from './slices/cartSlice';
// import wishlistReducer from './slices/wishlistSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['theme'], // persist theme preference
};

const rootReducer = combineReducers({
    theme: themeReducer,
    // auth: authReducer,
    // cart: cartReducer,
    // wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);