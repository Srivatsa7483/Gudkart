# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GudCart is a React Native e-commerce mobile app built with Expo (~54.0.0), targeting iOS, Android, and Web.

## Commands

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

No test or lint scripts are configured.

## Architecture

### State Management — Two Layers

The app uses **two separate state systems** that coexist:

1. **Context API** (primary, in-use): `AuthContext`, `CartContext`, `NotificationContext` in `src/context/`. These drive actual app behavior and persist to AsyncStorage.
2. **Redux Toolkit** (secondary, partially unused): `src/store/` has slices for theme, auth, cart, and wishlist — but only the theme slice is actively used (via redux-persist). The auth/cart/wishlist Redux slices exist but the app uses Context for those.

Custom hooks (`src/hooks/useAuth.js`, `src/hooks/useCart.js`, `src/hooks/useTheme.js`) wrap these contexts for consumption in components.

### Navigation

```
AppNavigator (Stack)
├── SplashScreen
├── AuthStack (if not authenticated)
│   ├── OnboardingScreen
│   ├── LoginScreen
│   └── RegisterScreen
└── BottomTabNavigator (if authenticated)
    ├── HomeStack → HomeScreen, CategoryScreen, ProductListScreen, ProductDetailScreen, SearchScreen
    ├── ExploreScreen
    ├── CartScreen → CheckoutScreen → AddAddressScreen → OrderSuccessScreen
    ├── SavedScreen (wishlist)
    └── ProfileStack → ProfileScreen, EditProfileScreen, SettingsScreen, ThemeSettingsScreen
```

Global screens accessible outside tabs: Orders, OrderDetail, Notifications, AddReview.

### API Layer

- **Base URL**: `https://sellsathi-refactored.onrender.com` (or `REACT_APP_API_URL` env var)
- **Client**: Axios in `src/services/api/apiClient.js` with a request interceptor that injects `Authorization: Bearer <token>` from AsyncStorage
- **Services**: `authService`, `cartService`, `productService`, `orderService`, `addressService`, `Profileservice`
- Cart API endpoints pattern: `GET/POST /consumer/{uid}/cart`

### Authentication Flow

1. Firebase credentials (Google/Apple/email) → Firebase ID token
2. Token sent to backend `/auth/login` or `/auth/register`
3. Backend returns its own token + user object
4. Both stored in AsyncStorage; `AuthContext` restores session on app start
5. User ID normalization: backend may return `id`, `_id`, or `uid` — `AuthContext` normalizes these

### Cart Architecture

`CartContext` maintains local cart state with fire-and-forget server sync:
- On load: pulls from server if authenticated, else from AsyncStorage
- On mutation: updates local state immediately, then syncs to server asynchronously
- Item shape: `{ id, name, price, originalPrice, discount, image, color, quantity, inStock, seller }`

### Theme System

Theme is persisted via Redux + redux-persist. `src/config/` holds theme definitions. `useTheme()` hook provides the current theme to components.
