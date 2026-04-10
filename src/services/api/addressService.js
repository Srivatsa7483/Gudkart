import apiClient from './apiClient';

/**
 * Address Service
 * GET    /consumer/:uid/addresses
 * POST   /consumer/:uid/address   ← body must be { address: { ... } }
 * DELETE /consumer/:uid/address/:addressId
 */

const addressService = {

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
     * Add or update an address.
     *
     * Backend (consumerController.js) does:
     *   const { address } = req.body;
     *   if (!address.firstName || !address.lastName || !address.addressLine
     *       || !address.city || !address.state || !address.pincode) → 400
     *
     * So the ENTIRE object must be nested under the "address" key.
     *
     * @param {string} uid
     * @param {Object} p - flat payload from AddAddressScreen
     */
    addAddress: async (uid, p) => {
        try {
            // Nest under "address" — this is what the backend destructures
            const body = {
                address: {
                    firstName: p.firstName,    // Required
                    lastName: p.lastName,     // Required
                    addressLine: p.addressLine,  // Required
                    city: p.city,         // Required
                    state: p.state,        // Required
                    pincode: p.pincode,      // Required
                    phone: p.phone || '',
                    landmark: p.landmark || '',
                    isDefault: p.isDefault ?? false,
                    type: p.type || 'shipping',
                    ...(p.id ? { id: p.id } : {}),
                },
            };

            console.log('[addressService] → POST /consumer/:uid/address', JSON.stringify(body, null, 2));

            const response = await apiClient.post(`/consumer/${uid}/address`, body);
            return response.data;
        } catch (error) {
            console.error('[addressService] status:', error?.response?.status);
            console.error('[addressService] error:', JSON.stringify(error?.response?.data));
            throw error;
        }
    },

    deleteAddress: async (uid, addressId) => {
        try {
            const response = await apiClient.delete(`/consumer/${uid}/address/${addressId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    },
};

export default addressService;