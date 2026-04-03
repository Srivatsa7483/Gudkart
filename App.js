// ─── App.js ────────────────────────────────────────────────────────────────

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { store, persistor } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';

const LoadingFallback = () => (
    <View style={{ flex: 1, backgroundColor: '#0D0B1E', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#F5C842" size="large" />
    </View>
);

export default function App() {
    return (
        <GestureHandlerRootView style={styles.root}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <PersistGate loading={<LoadingFallback />} persistor={persistor}>
                        <AuthProvider>
                            <NotificationProvider>
                                <AppNavigator />
                            </NotificationProvider>
                        </AuthProvider>
                    </PersistGate>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
});