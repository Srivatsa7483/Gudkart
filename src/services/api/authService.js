import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles user login, registration, and email verification
 */

const authService = {
    /**
     * Authenticate user and return role + status
     */
    login: async (credentials) => {
        try {
            const payload = {
                idToken: credentials.idToken,
                isTest: credentials.isTest || false,
                email: credentials.email,
                phone: credentials.phone,
            };

            console.log('📤 [authService.login] → POST /auth/login');
            console.log('📤 [authService.login] Payload:', JSON.stringify(payload, null, 2));

            const response = await apiClient.post('/auth/login', payload);

            console.log('📥 [authService.login] ← Status:', response.status);
            console.log('📥 [authService.login] Response:', JSON.stringify(response.data, null, 2));

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('❌ [authService.login] Error:', error?.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Register a new consumer or update existing profile
     */
    register: async (registrationData) => {
        try {
            const payload = {
                idToken: registrationData.idToken,
                phone: registrationData.phone,
                fullName: registrationData.fullName,
                dob: registrationData.dob,
                email: registrationData.email,
                password: registrationData.password,
                isTest: registrationData.isTest || false,
            };

            console.log('📤 [authService.register] → POST /auth/register');
            console.log('📤 [authService.register] Payload:', JSON.stringify(payload, null, 2));

            const response = await apiClient.post('/auth/register', payload);

            console.log('📥 [authService.register] ← Status:', response.status);
            console.log('📥 [authService.register] Response:', JSON.stringify(response.data, null, 2));

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('❌ [authService.register] Error:', error?.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Send OTP to email for verification
     */
    sendEmailOTP: async (email) => {
        try {
            console.log('📤 [authService.sendEmailOTP] → POST /auth/send-email-otp');
            console.log('📤 [authService.sendEmailOTP] Payload:', JSON.stringify({ email }, null, 2));

            const response = await apiClient.post('/auth/send-email-otp', { email });

            console.log('📥 [authService.sendEmailOTP] ← Status:', response.status);
            console.log('📥 [authService.sendEmailOTP] Response:', JSON.stringify(response.data, null, 2));

            return response.data;
        } catch (error) {
            console.error('❌ [authService.sendEmailOTP] Error:', error?.response?.data || error.message);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },
};

export default authService;