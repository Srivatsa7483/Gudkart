import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load wishlist on mount
    useEffect(() => {
        loadWishlistFromLocal();
    }, []);

    const loadWishlistFromLocal = async () => {
        try {
            const saved = await AsyncStorage.getItem('@wishlist_items');
            if (saved) {
                setWishlistItems(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading wishlist from local storage:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveWishlistToLocal = async (items) => {
        try {
            await AsyncStorage.setItem('@wishlist_items', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving wishlist to local storage:', error);
        }
    };

    const toggleWishlist = useCallback((product) => {
        setWishlistItems(prev => {
            const exists = prev.find(item => item.id === product.id);
            let updated;
            if (exists) {
                updated = prev.filter(item => item.id !== product.id);
            } else {
                // Normalise the item to ensure it has all needed fields for the Saved screen
                const newItem = {
                    id: product.id,
                    name: product.title || product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    savedPrice: product.price,
                    discount: product.discount || 0,
                    rating: product.rating || 0,
                    reviews: product.reviewCount || product.reviews || 0,
                    category: product.category || 'Product',
                    badge: product.badge || (product.discount > 20 ? 'HOT' : null),
                    badgeColor: product.badgeColor || '#F472B6',
                    emoji: product.emoji || '📦',
                    image: product.image || product.images?.[0],
                    inStock: product.inStock !== false,
                    savedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                };
                updated = [...prev, newItem];
            }
            saveWishlistToLocal(updated);
            return updated;
        });
    }, []);

    const removeFromWishlist = useCallback((productId) => {
        setWishlistItems(prev => {
            const updated = prev.filter(item => item.id !== productId);
            saveWishlistToLocal(updated);
            return updated;
        });
    }, []);

    const removeMultipleFromWishlist = useCallback((productIds) => {
        setWishlistItems(prev => {
            const updated = prev.filter(item => !productIds.includes(item.id));
            saveWishlistToLocal(updated);
            return updated;
        });
    }, []);

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const value = {
        wishlistItems,
        isLoading,
        toggleWishlist,
        removeFromWishlist,
        removeMultipleFromWishlist,
        isInWishlist,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export default WishlistContext;
