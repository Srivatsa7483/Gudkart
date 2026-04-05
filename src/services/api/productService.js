import apiClient from './apiClient';

/**
 * Product Service
 * Handles product browsing and detail fetching
 */

const productService = {
    /**
     * Fetch all available products for browsing
     * @param {Object} [params] - Optional query parameters
     * @param {number} [params.page] - Page number for pagination
     * @param {number} [params.limit] - Number of items per page
     * @param {string} [params.category] - Filter by category
     * @param {string} [params.search] - Search query
     * @param {string} [params.sortBy] - Sort field (price, name, rating)
     * @param {string} [params.order] - Sort order (asc, desc)
     * @returns {Promise} List of products
     */
    getAllProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/products', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    /**
     * Fetch detailed information of a single product
     * @param {string} productId - Product ID
     * @returns {Promise} Product details
     */
    getProductById: async (productId) => {
        try {
            const response = await apiClient.get(`/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    },

    /**
     * Search products by query
     * @param {string} query - Search query
     * @param {Object} [filters] - Additional filters
     * @returns {Promise} Search results
     */
    searchProducts: async (query, filters = {}) => {
        try {
            const response = await apiClient.get('/products', {
                params: {
                    search: query,
                    ...filters,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    /**
     * Get products by category
     * @param {string} category - Category name or ID
     * @param {Object} [params] - Additional parameters
     * @returns {Promise} Category products
     */
    getProductsByCategory: async (category, params = {}) => {
        try {
            const response = await apiClient.get('/products', {
                params: {
                    category,
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching category ${category}:`, error);
            throw error;
        }
    },

    /**
     * Get featured or recommended products
     * @param {Object} [params] - Query parameters
     * @returns {Promise} Featured products
     */
    getFeaturedProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/products', {
                params: {
                    featured: true,
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching featured products:', error);
            throw error;
        }
    },
};

export default productService;