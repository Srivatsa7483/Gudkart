import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('@cart_items');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveCart = async (items) => {
        try {
            await AsyncStorage.setItem('@cart_items', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addToCart = (product, quantity = 1, color = null) => {
        const newCart = [...cartItems];
        const existingIndex = newCart.findIndex(
            item => item.id === product.id && item.color === color
        );

        if (existingIndex >= 0) {
            newCart[existingIndex].quantity += quantity;
        } else {
            newCart.push({ ...product, quantity, color });
        }

        setCartItems(newCart);
        saveCart(newCart);
    };

    const removeFromCart = (productId, color = null) => {
        const newCart = cartItems.filter(
            item => !(item.id === productId && item.color === color)
        );
        setCartItems(newCart);
        saveCart(newCart);
    };

    const updateQuantity = (productId, quantity, color = null) => {
        if (quantity < 1) return;
        const newCart = cartItems.map(item =>
            (item.id === productId && item.color === color)
                ? { ...item, quantity }
                : item
        );
        setCartItems(newCart);
        saveCart(newCart);
    };

    const clearCart = () => {
        setCartItems([]);
        saveCart([]);
    };

    const value = {
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
