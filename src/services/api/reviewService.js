import apiClient from './apiClient';

const ROUTES = {
    REVIEWS: '/reviews',
    PRODUCT_REVIEWS: '/reviews/product',
    ELIGIBILITY: '/reviews/check-eligibility'
};

const reviewService = {
    /**
     * Submit a new product review.
     * @param {Object} reviewData - { productId, orderId, rating, title, body, images }
     * @returns {Promise<Object>} { success, message, reviewId }
     */
    submitReview: async (reviewData) => {
        try {
            const response = await apiClient.post(ROUTES.REVIEWS, reviewData);
            return response.data;
        } catch (error) {
            console.error('[reviewService] submitReview error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get active reviews for a specific product.
     * @param {string} productId
     * @returns {Promise<Object>} { success, reviews: [] }
     */
    getProductReviews: async (productId) => {
        try {
            const response = await apiClient.get(`${ROUTES.PRODUCT_REVIEWS}/${productId}`);
            return response.data;
        } catch (error) {
            console.error('[reviewService] getProductReviews error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Check if the authenticated user is eligible to review a product.
     * @param {string} productId
     * @returns {Promise<Object>} { success, eligible, order }
     */
    checkEligibility: async (productId) => {
        try {
            const response = await apiClient.get(`${ROUTES.ELIGIBILITY}/${productId}`);
            return response.data;
        } catch (error) {
            console.error('[reviewService] checkEligibility error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default reviewService;
