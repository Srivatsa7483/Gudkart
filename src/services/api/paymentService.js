import apiClient from './apiClient';

/**
 * Payment Service
 *
 * Maps to paymentController.js which exports: createOrder, verifyPayment, codOrder
 *
 * ⚠️  ROUTE PATHS: Check your backend router file (e.g. paymentRoutes.js) to confirm
 *     the exact paths. Common patterns:
 *       /payment/create-order   ← most likely
 *       /payments/create-order
 *       /orders/payment/create
 *     Update the three ROUTE constants below if your paths differ.
 */

const ROUTES = {
    CREATE_ORDER: '/payment/create-order',   // POST /create-order → createOrder
    VERIFY: '/payment/verify',          // POST /verify       → verifyPayment  (no auth)
    COD: '/payment/cod-order',       // POST /cod-order    → codOrder
};

const paymentService = {

    /**
     * Step 1 — Create a Razorpay order on the backend.
     * Returns: { success, order: { id, amount, currency }, key_id }
     *
     * @param {number} amount       - Total in INR
     * @param {Array}  cartItems    - Mapped cart items
     * @param {Object} customerInfo - { firstName, lastName, email, phone, ... }
     */
    createRazorpayOrder: async (amount, cartItems, customerInfo) => {
        try {
            const response = await apiClient.post(ROUTES.CREATE_ORDER, {
                amount,
                cartItems,
                customerInfo,
            });
            console.log('[paymentService] createRazorpayOrder ✓', response.data);
            return response.data;
        } catch (error) {
            console.error('[paymentService] createRazorpayOrder ✗', error?.response?.status, error?.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Step 2 — Verify Razorpay signature. On success the backend:
     *   - Creates the order in Firestore
     *   - Generates invoice + sends email (background)
     *   - Creates Shiprocket shipment (background)
     *   - Reduces stock (background)
     *
     * Returns: { success, orderId, documentId }
     *
     * @param {Object} p
     * @param {string} p.razorpay_payment_id
     * @param {string} p.razorpay_order_id
     * @param {string} p.razorpay_signature
     * @param {Array}  p.cartItems
     * @param {Object} p.customerInfo
     * @param {number} p.amount
     * @param {string} p.uid
     * @param {Object} [p.platformFeeBreakdown]
     * @param {number} [p.couponDiscount]
     */
    verifyPayment: async (p) => {
        try {
            const response = await apiClient.post(ROUTES.VERIFY, p);
            console.log('[paymentService] verifyPayment ✓', response.data);
            return response.data;
        } catch (error) {
            console.error('[paymentService] verifyPayment ✗', error?.response?.status, error?.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Place a Cash-on-Delivery order.
     * Backend creates Firestore order + runs background tasks.
     * Returns: { success, orderId, documentId }
     *
     * @param {Object} p
     * @param {string} p.uid
     * @param {Array}  p.cartItems
     * @param {Object} p.customerInfo
     * @param {number} p.amount
     * @param {Object} [p.platformFeeBreakdown]
     * @param {number} [p.couponDiscount]
     */
    placeCODOrder: async (p) => {
        try {
            const response = await apiClient.post(ROUTES.COD, p);
            console.log('[paymentService] placeCODOrder ✓', response.data);
            return response.data;
        } catch (error) {
            console.error('[paymentService] placeCODOrder ✗', error?.response?.status, error?.response?.data || error.message);
            throw error;
        }
    },
};

export default paymentService;