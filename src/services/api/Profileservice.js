import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Profile Service
 * Handles user profile, addresses, and account management
 */

const profileService = {
    // ========== Profile Management ==========

    /**
     * Fetch user profile details
     * @param {string} uid - User ID
     * @returns {Promise} User profile data
     */
    getProfile: async (uid) => {
        try {
            const response = await apiClient.get(`/consumer/${uid}/profile`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    /**
     * Update user profile
     * @param {string} uid - User ID
     * @param {Object} profileData - Profile data to update
     * @param {string} [profileData.fullName] - Full name
     * @param {string} [profileData.email] - Email address
     * @param {string} [profileData.phone] - Phone number
     * @param {string} [profileData.dob] - Date of birth
     * @param {string} [profileData.gender] - Gender
     * @param {string} [profileData.avatar] - Avatar URL
     * @returns {Promise} Updated profile
     */
    updateProfile: async (uid, profileData) => {
        try {
            const response = await apiClient.post(`/consumer/${uid}/profile`, profileData);

            // Update persisted user in AsyncStorage
            const stored = await AsyncStorage.getItem('@auth_user');
            const currentUser = stored ? JSON.parse(stored) : {};
            await AsyncStorage.setItem('@auth_user', JSON.stringify({ ...currentUser, ...response.data }));

            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    /**
     * Delete consumer account permanently
     * @param {string} uid - User ID
     * @returns {Promise} Deletion confirmation
     */
    deleteAccount: async (uid) => {
        try {
            const response = await apiClient.delete(`/consumer/${uid}/account`);

            // Clear persisted auth data
            await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);

            return response.data;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    },

    // ========== Address Management ==========

    /**
     * Get all saved addresses of the user
     * @param {string} uid - User ID
     * @returns {Promise} Array of addresses
     */
    getAddresses: async (uid) => {
        try {
            const response = await apiClient.get(`/consumer/${uid}/addresses`);
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },

    /**
     * Add a new shipping address
     * @param {string} uid - User ID
     * @param {Object} address - Address details
     * @param {string} address.name - Recipient name
     * @param {string} address.phone - Contact phone
     * @param {string} address.addressLine1 - Address line 1
     * @param {string} [address.addressLine2] - Address line 2
     * @param {string} address.city - City
     * @param {string} address.state - State
     * @param {string} address.pincode - Pincode
     * @param {string} [address.landmark] - Landmark
     * @param {string} address.type - Address type (home, work, other)
     * @param {boolean} [address.isDefault] - Set as default address
     * @returns {Promise} Created address
     */
    addAddress: async (uid, address) => {
        try {
            const response = await apiClient.post(`/consumer/${uid}/address`, address);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    /**
     * Delete a saved address
     * @param {string} uid - User ID
     * @param {string} addressId - Address ID to delete
     * @returns {Promise} Deletion confirmation
     */
    deleteAddress: async (uid, addressId) => {
        try {
            const response = await apiClient.delete(`/consumer/${uid}/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    },

    // ========== Wishlist Management ==========

    /**
     * Fetch wishlist items
     * @param {string} uid - User ID
     * @returns {Promise} Wishlist items
     */
    getWishlist: async (uid) => {
        try {
            const response = await apiClient.get(`/consumer/${uid}/wishlist`);
            return response.data;
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            throw error;
        }
    },

    /**
     * Add product to wishlist
     * @param {string} uid - User ID
     * @param {Object} product - Product to add
     * @param {string} product.productId - Product ID
     * @param {string} [product.variant] - Product variant
     * @returns {Promise} Updated wishlist
     */
    addToWishlist: async (uid, product) => {
        try {
            const response = await apiClient.post(`/consumer/${uid}/wishlist/add`, product);
            return response.data;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    },

    /**
     * Remove product from wishlist
     * @param {string} uid - User ID
     * @param {string} productId - Product ID to remove
     * @returns {Promise} Updated wishlist
     */
    removeFromWishlist: async (uid, productId) => {
        try {
            const response = await apiClient.delete(`/consumer/${uid}/wishlist/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    },

    /**
     * Check if product is in wishlist
     * @param {string} uid - User ID
     * @param {string} productId - Product ID to check
     * @returns {Promise<boolean>} True if in wishlist
     */
    isInWishlist: async (uid, productId) => {
        try {
            const wishlist = await profileService.getWishlist(uid);
            return wishlist.items?.some((item) => item.productId === productId) || false;
        } catch (error) {
            console.error('Error checking wishlist:', error);
            return false;
        }
    },

    /**
     * Toggle product in wishlist
     * @param {string} uid - User ID
     * @param {string} productId - Product ID
     * @returns {Promise} Updated wishlist
     */
    toggleWishlist: async (uid, productId) => {
        try {
            const inWishlist = await profileService.isInWishlist(uid, productId);

            if (inWishlist) {
                return await profileService.removeFromWishlist(uid, productId);
            } else {
                return await profileService.addToWishlist(uid, { productId });
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            throw error;
        }
    },

    /**
     * Clear entire wishlist
     * @param {string} uid - User ID
     * @returns {Promise} Empty wishlist
     */
    clearWishlist: async (uid) => {
        try {
            const wishlist = await profileService.getWishlist(uid);
            const items = wishlist.items || [];

            // Remove all items
            await Promise.all(
                items.map((item) => profileService.removeFromWishlist(uid, item.productId))
            );

            return { items: [], message: 'Wishlist cleared' };
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            throw error;
        }
    },
};

export default profileService;