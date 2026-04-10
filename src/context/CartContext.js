import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartService from '../services/api/cartService';
import { useAuth } from '../hooks/useAuth'; // provides { user } with user.uid

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Get the authenticated user — uid is needed for all API calls
    const { user } = useAuth();
    const uid = user?.uid;

    // Ref to prevent saving stale data during initial load
    const hasLoaded = useRef(false);

    // ─── Load cart on mount / login ─────────────────────────────────────────
    useEffect(() => {
        if (uid) {
            loadCartFromServer();
        } else {
            // Not logged in — load from local storage only
            loadCartFromLocal();
        }
    }, [uid]);

    // ─── Persist to AsyncStorage whenever cartItems change (offline backup) ─
    useEffect(() => {
        if (hasLoaded.current) {
            saveCartToLocal(cartItems);
        }
    }, [cartItems]);

    // ─── Server sync ────────────────────────────────────────────────────────
    const loadCartFromServer = async () => {
        setIsLoading(true);
        try {
            const data = await cartService.getCart(uid);
            const serverItems = data?.items || data?.cartItems || [];
            // Normalise server items to the shape our screens expect
            const normalised = serverItems.map(normaliseItem);
            setCartItems(normalised);
            hasLoaded.current = true;
        } catch (error) {
            console.warn('Failed to load cart from server, falling back to local:', error.message);
            await loadCartFromLocal();
        } finally {
            setIsLoading(false);
        }
    };

    const syncCartToServer = async (items) => {
        if (!uid) return; // can't sync without a user
        setIsSyncing(true);
        try {
            // Shape items to what the API expects
            const apiItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                variant: item.color || null,
                price: item.price,
                name: item.name,
                image: item.image,
                originalPrice: item.originalPrice,
                discount: item.discount,
                seller: item.seller,
            }));
            await cartService.updateCart(uid, apiItems);
        } catch (error) {
            console.warn('Failed to sync cart to server:', error.message);
            // Local state is still correct — user can keep shopping;
            // next load will attempt server sync again.
        } finally {
            setIsSyncing(false);
        }
    };

    // ─── Local storage helpers ──────────────────────────────────────────────
    const loadCartFromLocal = async () => {
        try {
            const saved = await AsyncStorage.getItem('@cart_items');
            if (saved) {
                setCartItems(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading cart from local storage:', error);
        } finally {
            hasLoaded.current = true;
            setIsLoading(false);
        }
    };

    const saveCartToLocal = async (items) => {
        try {
            await AsyncStorage.setItem('@cart_items', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart to local storage:', error);
        }
    };

    // ─── Normalise a server cart item to the shape screens use ──────────────
    const normaliseItem = (item) => ({
        id: item.productId || item.id,
        name: item.name || '',
        price: item.price || 0,
        originalPrice: item.originalPrice || item.price || 0,
        discount: item.discount || 0,
        image: item.image || item.images?.[0] || null,
        color: item.variant || item.color || null,
        quantity: item.quantity || 1,
        inStock: item.inStock !== false,
        seller: item.seller || 'Sellsathi',
    });

    // ─── Cart operations ────────────────────────────────────────────────────

    const addToCart = useCallback((product, quantity = 1, selectedColor = null) => {
        let message = '';
        setCartItems(prev => {
            const existingIdx = prev.findIndex(
                item => item.id === product.id && item.color === selectedColor
            );

            let updated;
            if (existingIdx > -1) {
                updated = [...prev];
                updated[existingIdx] = {
                    ...updated[existingIdx],
                    quantity: updated[existingIdx].quantity + quantity,
                };
                message = 'Quantity updated in cart';
            } else {
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    discount: product.discount || 0,
                    image: product.image || product.images?.[0],
                    color: selectedColor,
                    quantity,
                    inStock: product.inStock !== false,
                    seller: product.seller || 'Sellsathi',
                };
                updated = [...prev, newItem];
                message = 'Added to cart successfully';
            }

            // Fire-and-forget server sync
            syncCartToServer(updated);
            return updated;
        });

        return { success: true, message };
    }, [uid]);

    const removeFromCart = useCallback((itemId, color = null) => {
        setCartItems(prev => {
            const updated = prev.filter(
                item => !(item.id === itemId && item.color === color)
            );
            syncCartToServer(updated);
            return updated;
        });
        return { success: true, message: 'Removed from cart' };
    }, [uid]);

    const updateQuantity = useCallback((itemId, newQuantity, color = null) => {
        if (newQuantity < 1) {
            return removeFromCart(itemId, color);
        }
        if (newQuantity > 10) {
            return { success: false, message: 'Maximum 10 items per product' };
        }

        setCartItems(prev => {
            const updated = prev.map(item =>
                item.id === itemId && item.color === color
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            syncCartToServer(updated);
            return updated;
        });
        return { success: true, message: 'Quantity updated' };
    }, [uid]);

    const clearCart = useCallback(() => {
        setCartItems([]);
        syncCartToServer([]);
        return { success: true, message: 'Cart cleared' };
    }, [uid]);

    // ─── Computed helpers ───────────────────────────────────────────────────

    const getCartCount = () =>
        cartItems.reduce((total, item) => total + item.quantity, 0);

    const getCartTotal = () =>
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const getTotalSavings = () =>
        cartItems.reduce(
            (total, item) => total + (item.originalPrice - item.price) * item.quantity,
            0
        );

    const isInCart = (productId, color = null) =>
        cartItems.some(item => item.id === productId && item.color === color);

    const getItemQuantity = (productId, color = null) => {
        const item = cartItems.find(i => i.id === productId && i.color === color);
        return item ? item.quantity : 0;
    };

    // ─── Context value ──────────────────────────────────────────────────────
    const value = {
        cartItems,
        isLoading,
        isSyncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        getTotalSavings,
        isInCart,
        getItemQuantity,
        refreshCart: loadCartFromServer, // manual refresh if needed
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;