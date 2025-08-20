const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new payment record.
 * @param {object} paymentData - The payment data.
 * @returns {Promise<object>} The newly created payment record.
 */
const createPayment = async (paymentData) => {
    try {
        const {
            user_id,
            subscription_id,
            plan_id,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount,
            currency,
            status,
        } = paymentData;

        const query = `
            INSERT INTO payments (user_id, subscription_id, plan_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [user_id, subscription_id, plan_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, status];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('[Payment Repository Error - createPayment]:', error);
        throw error;
    }
};

/**
 * @description Retrieves all payments, optionally filtered by user_id.
 * @param {string} [userId] - Optional user UUID to filter payments by.
 * @returns {Promise<Array<object>>} A list of payments.
 */
const getAllPayments = async (userId) => {
    try {
        let query = 'SELECT * FROM payments';
        const values = [];

        if (userId) {
            query += ' WHERE user_id = $1';
            values.push(userId);
        }
        
        query += ' ORDER BY created_at DESC;';

        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('[Payment Repository Error - getAllPayments]:', error);
        throw error;
    }
};

/**
 * @description Retrieves a single payment by its ID.
 * @param {string} id - The UUID of the payment.
 * @returns {Promise<object|null>} The payment object or null if not found.
 */
const getPaymentById = async (id) => {
    try {
        const query = 'SELECT * FROM payments WHERE id = $1;';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Payment Repository Error - getPaymentById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Updates a payment's status by its ID.
 * @param {string} id - The UUID of the payment to update.
 * @param {object} updates - An object with the fields to update (e.g., status).
 * @returns {Promise<object|null>} The updated payment object.
 */
const updatePaymentById = async (id, updates) => {
    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return getPaymentById(id);
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const query = `
            UPDATE payments
            SET ${setClause}
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Payment Repository Error - updatePaymentById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Deletes a payment record by its ID.
 * @param {string} id - The UUID of the payment to delete.
 * @returns {Promise<object|null>} The deleted payment object.
 */
const deletePaymentById = async (id) => {
    try {
        const query = `
            DELETE FROM payments
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Payment Repository Error - deletePaymentById ${id}]:`, error);
        throw error;
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentById,
    deletePaymentById,
};
