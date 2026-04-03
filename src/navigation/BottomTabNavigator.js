// ─── BottomTabNavigator.js ─────────────────────────────────────────────────
// Gudkart — Expo Go compatible
// All 5 tabs wired: Home ✅  Explore ✅  Cart ✅  Saved ✅  Profile ✅

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../hooks/useTheme';

import HomeStack from './HomeStack';
import ExploreScreen from '../screens/explore/ExploreScreen';
import CartScreen from '../screens/cart/CartScreen';
import SavedScreen from '../screens/wishlist/SavedScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
    { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Explore', icon: 'search', iconOutline: 'search-outline' },
    { name: 'Cart', icon: 'bag', iconOutline: 'bag-outline' },
    { name: 'Saved', icon: 'heart', iconOutline: 'heart-outline' },
    { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

// ─── Custom Tab Bar ─────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.tabBarWrapper, 
            { 
                backgroundColor: colors.tabBar, 
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 12), // Add padding for system bar
            }
        ]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const config = TAB_CONFIG[index];

                const onPress = () => {
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                };

                return (
                    <View key={route.key} style={styles.tabItem}>
                        <View
                            style={styles.tabButton}
                            onStartShouldSetResponder={() => true}
                            onResponderRelease={onPress}
                        >
                            {isFocused && (
                                <View style={[styles.activeIndicator, { backgroundColor: colors.tabActive }]} />
                            )}
                            <Ionicons
                                name={isFocused ? config.icon : config.iconOutline}
                                size={22}
                                color={isFocused ? colors.tabActive : colors.tabInactive}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused ? colors.tabActive : colors.tabInactive,
                                        fontWeight: isFocused ? '700' : '400',
                                    },
                                ]}
                            >
                                {route.name}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

// ─── Navigator ─────────────────────────────────────────────────────────────
const BottomTabNavigator = () => (
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
    >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
        <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
);

const styles = StyleSheet.create({
    tabBarWrapper: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    tabItem: { flex: 1, alignItems: 'center' },
    tabButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 2, minWidth: 50 },
    activeIndicator: { position: 'absolute', top: -6, width: 24, height: 3, borderRadius: 2 },
    tabLabel: { fontSize: 10 },
});

export default BottomTabNavigator;