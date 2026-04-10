import apiClient from './apiClient';

/**
 * Authentication Service
 * Handles user login, registration, and email verification
 *
 * NOTE: Token/user persistence is handled by AuthContext, NOT here.
 * This service only makes API calls and returns the response data.
 */

const authService = {
    /**
     * Authenticate user and return role + status
     * @param {Object} credentials
     * @param {string} credentials.idToken  - Firebase ID token (required)
     * @param {boolean} credentials.isTest  - Always false in production
     * @param {string} [credentials.email]  - User email
     * @param {string} [credentials.phone]  - User phone
     * @returns {Promise} { token, user: { uid/id, email, ... }, role, status }
     */
    login: async (credentials) => {
        try {
            const payload = {
                idToken: credentials.idToken,   // real Firebase idToken
                isTest: false,                  // always false — real Firebase auth
                email: credentials.email || null,
                phone: credentials.phone || null,
            };

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📤 [authService.login] → POST /auth/login');
            console.log('📤 [authService.login] Payload being sent:');
            console.log('   isTest  :', payload.isTest);
            console.log('   email   :', payload.email);
            console.log('   phone   :', payload.phone);
            console.log('   idToken :', payload.idToken
                ? payload.idToken.substring(0, 60) + '...'
                : 'NULL ❌');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            const response = await apiClient.post('/auth/login', payload);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📥 [authService.login] ← Response received');
            console.log('📥 [authService.login] HTTP Status :', response.status);
            console.log('📥 [authService.login] Response Data:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return response.data;
        } catch (error) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ [authService.login] Request failed');
            console.error('❌ HTTP Status  :', error?.response?.status);
            console.error('❌ Error Data   :', JSON.stringify(error?.response?.data, null, 2));
            console.error('❌ Error Message:', error.message);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            throw error;
        }
    },

    /**
     * Register a new consumer or update existing profile
     * @param {Object} registrationData
     * @param {string} registrationData.idToken   - Firebase ID token (required)
     * @param {boolean} registrationData.isTest   - Always false in production
     * @param {string} registrationData.fullName
     * @param {string} registrationData.email
     * @param {string} registrationData.phone     - Include country code e.g. +919876543210
     * @param {string} registrationData.password
     * @param {string} [registrationData.dob]
     * @returns {Promise} { token, user: { uid/id, email, ... } }
     */
    register: async (registrationData) => {
        try {
            const payload = {
                idToken: registrationData.idToken,  // real Firebase idToken
                isTest: false,                       // always false — real Firebase auth
                phone: registrationData.phone,
                fullName: registrationData.fullName,
                dob: registrationData.dob || null,
                email: registrationData.email,
                password: registrationData.password,
            };

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📤 [authService.register] → POST /auth/register');
            console.log('📤 [authService.register] Payload being sent:');
            console.log('   isTest   :', payload.isTest);
            console.log('   fullName :', payload.fullName);
            console.log('   email    :', payload.email);
            console.log('   phone    :', payload.phone);
            console.log('   dob      :', payload.dob);
            console.log('   idToken  :', payload.idToken
                ? payload.idToken.substring(0, 60) + '...'
                : 'NULL ❌');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            const response = await apiClient.post('/auth/register', payload);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📥 [authService.register] ← Response received');
            console.log('📥 [authService.register] HTTP Status :', response.status);
            console.log('📥 [authService.register] Response Data:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return response.data;
        } catch (error) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ [authService.register] Request failed');
            console.error('❌ HTTP Status  :', error?.response?.status);
            console.error('❌ Error Data   :', JSON.stringify(error?.response?.data, null, 2));
            console.error('❌ Error Message:', error.message);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            throw error;
        }
    },

    /**
     * Send OTP to email for verification
     * @param {string} email
     * @returns {Promise} Server response
     */
    sendEmailOTP: async (email) => {
        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📤 [authService.sendEmailOTP] → POST /auth/send-email-otp');
            console.log('📤 [authService.sendEmailOTP] Email:', email);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            const response = await apiClient.post('/auth/send-email-otp', { email });

            console.log('📥 [authService.sendEmailOTP] ← HTTP Status:', response.status);
            console.log('📥 [authService.sendEmailOTP] Response Data:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return response.data;
        } catch (error) {
            console.error('❌ [authService.sendEmailOTP] Request failed');
            console.error('❌ HTTP Status  :', error?.response?.status);
            console.error('❌ Error Data   :', JSON.stringify(error?.response?.data, null, 2));
            console.error('❌ Error Message:', error.message);
            throw error;
        }
    },
};

export default authService;