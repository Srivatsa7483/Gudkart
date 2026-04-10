import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - update this with your actual backend URL
const BASE_URL = process.env.REACT_APP_API_URL || 'https://sellsathi-refactored.onrender.com';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - auto-refresh Firebase token before each request
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Try to get a fresh Firebase ID token (auto-refreshes if expired)
            let token = null;
            try {
                const { getAuth } = require('firebase/auth');
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (currentUser) {
                    // forceRefresh=false: uses cached token if still valid, refreshes if near expiry
                    token = await currentUser.getIdToken(false);
                    // Keep AsyncStorage in sync so the stored token stays fresh
                    await AsyncStorage.setItem('@auth_token', token);
                } else {
                    // No Firebase user — fall back to AsyncStorage (for non-Firebase flows)
                    token = await AsyncStorage.getItem('@auth_token');
                }
            } catch (firebaseErr) {
                // Firebase not available or user not signed in — fall back to stored token
                token = await AsyncStorage.getItem('@auth_token');
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('📡 [apiClient] No token available for request to:', config.url);
            }
        } catch (e) {
            console.error('📡 [apiClient] Failed to get auth token:', e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('📡 [apiClient] 401 Unauthorized — the token might be expired or invalid.');
                    // Don't remove the token automatically here as it causes subsequent 
                    // requests to fail with "Authorization required" without logging the user out.
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;