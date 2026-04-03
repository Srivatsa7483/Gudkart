// ─── AppNavigator.js ───────────────────────────────────────────────────────
// Gudkart — Expo Go compatible
//
// Root stack:
//   Auth  → Login / Register
//   Main  → Bottom Tabs (Home, Explore, Cart, Saved, Profile)
//   Orders → OrdersScreen  (pushed from Profile → My Orders)
// ──────────────────────────────────────────────────────────────────────────

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './BottomTabNavigator';
import AuthStack from './AuthStack';
import Splash from '../screens/auth/SplashScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import NotificationsScreen from '../screens/notification/NotificationsScreen';
import AddReviewScreen from '../screens/products/AddReviewScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Splash"       // ← Restore splash as entry
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
            {/* Splash */}
            <Stack.Screen name="Splash" component={Splash} />

            {/* Auth */}
            <Stack.Screen name="Auth" component={AuthStack} />

            {/* Main tabs */}
            <Stack.Screen name="Main" component={BottomTabNavigator} />

            {/* Orders & Notifications */}
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="AddReview" component={AddReviewScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);

export default AppNavigator;