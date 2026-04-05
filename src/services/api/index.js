/**
 * API Services Index
 * Central export point for all API services
 */

import apiClient from './apiClient';
import authService from './authService';
import productService from './productService';
import cartService from './cartService';
import orderService from './orderService';
import profileService from './Profileservice';

// Export individual services
export {
    apiClient,
    authService,
    productService,
    cartService,
    orderService,
    profileService,
};

// Default export with all services
export default {
    auth: authService,
    products: productService,
    cart: cartService,
    orders: orderService,
    profile: profileService,
};