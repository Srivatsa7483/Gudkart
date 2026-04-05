import apiClient from './apiClient';

/**
 * Cart Service
 * Handles shopping cart operations
 */

const cartService = {
    /**
     * Retrieve user's shopping cart
     * @param {string} uid - User ID
     * @returns {Promise} Cart data
     */
    getCart: async (uid) => {
        try {
            const response = await apiClient.get(`/consumer/${uid}/cart`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    /**
     * Update cart items
     * @param {string} uid - User ID
     * @param {Array} cartItems - Array of cart items
     * @param {string} cartItems[].productId - Product ID
     * @param {number} cartItems[].quantity - Item quantity
     * @param {string} [cartItems[].variant] - Product variant
     * @param {number} [cartItems[].price] - Item price
     * @returns {Promise} Updated cart data
     */
    updateCart: async (uid, cartItems) => {
        try {
            const response = await apiClient.post(`/consumer/${uid}/cart`, {
                cartItems,
            });
            return response.data;
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    /**
     * Add item to cart
     * @param {string} uid - User ID
     * @param {Object} item - Item to add
     * @param {string} item.productId - Product ID
     * @param {number} item.quantity - Quantity to add
     * @param {string} [item.variant] - Product variant
     * @returns {Promise} Updated cart
     */
    addToCart: async (uid, item) => {
        try {
            // First get current cart
            const currentCart = await cartService.getCart(uid);
            const cartItems = currentCart.items || [];

            // Check if item already exists
            const existingItemIndex = cartItems.findIndex(
                (cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.variant === item.variant
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                cartItems[existingItemIndex].quantity += item.quantity;
            } else {
                // Add new item
                cartItems.push(item);
            }

            // Update cart
            return await cartService.updateCart(uid, cartItems);
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    /**
     * Remove item from cart
     * @param {string} uid - User ID
     * @param {string} productId - Product ID to remove
     * @param {string} [variant] - Product variant
     * @returns {Promise} Updated cart
     */
    removeFromCart: async (uid, productId, variant = null) => {
        try {
            // Get current cart
            const currentCart = await cartService.getCart(uid);
            const cartItems = currentCart.items || [];

            // Filter out the item
            const updatedItems = cartItems.filter(
                (item) => !(item.productId === productId && item.variant === variant)
            );

            // Update cart
            return await cartService.updateCart(uid, updatedItems);
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    /**
     * Update item quantity in cart
     * @param {string} uid - User ID
     * @param {string} productId - Product ID
     * @param {number} quantity - New quantity
     * @param {string} [variant] - Product variant
     * @returns {Promise} Updated cart
     */
    updateQuantity: async (uid, productId, quantity, variant = null) => {
        try {
            // Get current cart
            const currentCart = await cartService.getCart(uid);
            const cartItems = currentCart.items || [];

            // Find and update the item
            const updatedItems = cartItems.map((item) => {
                if (item.productId === productId && item.variant === variant) {
                    return { ...item, quantity };
                }
                return item;
            });

            // Update cart
            return await cartService.updateCart(uid, updatedItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    },

    /**
     * Clear all items from cart
     * @param {string} uid - User ID
     * @returns {Promise} Empty cart
     */
    clearCart: async (uid) => {
        try {
            return await cartService.updateCart(uid, []);
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    },

    /**
     * Get cart item count
     * @param {string} uid - User ID
     * @returns {Promise<number>} Total number of items in cart
     */
    getCartCount: async (uid) => {
        try {
            const cart = await cartService.getCart(uid);
            const items = cart.items || [];
            return items.reduce((total, item) => total + (item.quantity || 0), 0);
        } catch (error) {
            console.error('Error getting cart count:', error);
            throw error;
        }
    },

    /**
     * Calculate cart total
     * @param {string} uid - User ID
     * @returns {Promise<number>} Cart total amount
     */
    getCartTotal: async (uid) => {
        try {
            const cart = await cartService.getCart(uid);
            const items = cart.items || [];
            return items.reduce(
                (total, item) => total + (item.price || 0) * (item.quantity || 0),
                0
            );
        } catch (error) {
            console.error('Error calculating cart total:', error);
            throw error;
        }
    },
};

export default cartService;