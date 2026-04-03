import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from AsyncStorage on app start
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to AsyncStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            saveCart();
        }
    }, [cartItems]);

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

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem('@cart_items', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    // Add item to cart
    const addToCart = (product, quantity = 1, selectedColor = null) => {
        const existingItemIndex = cartItems.findIndex(
            item => item.id === product.id && item.color === selectedColor
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            const updatedCart = [...cartItems];
            updatedCart[existingItemIndex].quantity += quantity;
            setCartItems(updatedCart);
            return { success: true, message: 'Quantity updated in cart' };
        } else {
            // Add new item
            const newItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                discount: product.discount || 0,
                image: product.image || product.images?.[0],
                color: selectedColor,
                quantity: quantity,
                inStock: product.inStock !== false,
                seller: product.seller || 'Sellsathi',
            };
            setCartItems([...cartItems, newItem]);
            return { success: true, message: 'Added to cart successfully' };
        }
    };

    // Remove item from cart
    const removeFromCart = (itemId, color = null) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.id === itemId && item.color === color))
        );
        return { success: true, message: 'Removed from cart' };
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity, color = null) => {
        if (newQuantity < 1) {
            return removeFromCart(itemId, color);
        }

        if (newQuantity > 10) {
            return { success: false, message: 'Maximum 10 items per product' };
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId && item.color === color
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
        return { success: true, message: 'Quantity updated' };
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        return { success: true, message: 'Cart cleared' };
    };

    // Get cart count
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Get cart total
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Get total savings
    const getTotalSavings = () => {
        return cartItems.reduce(
            (total, item) => total + ((item.originalPrice - item.price) * item.quantity),
            0
        );
    };

    // Check if item is in cart
    const isInCart = (productId, color = null) => {
        return cartItems.some(item => item.id === productId && item.color === color);
    };

    // Get item quantity in cart
    const getItemQuantity = (productId, color = null) => {
        const item = cartItems.find(item => item.id === productId && item.color === color);
        return item ? item.quantity : 0;
    };

    const value = {
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        getTotalSavings,
        isInCart,
        getItemQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;