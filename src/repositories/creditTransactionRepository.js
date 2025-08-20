const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new credit transaction.
 * @param {object} transactionData - The transaction data.
 * @returns {Promise<object>} The newly created transaction.
 */
const createCreditTransaction = async (transactionData) => {
    try {
        const {
            user_id,
            transaction_type,
            amount,
            related_payment_id,
            related_feature_code,
            description,
        } = transactionData;

        const query = `
            INSERT INTO credit_transactions (user_id, transaction_type, amount, related_payment_id, related_feature_code, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [user_id, transaction_type, amount, related_payment_id, related_feature_code, description];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('[Credit Transaction Repository Error - createCreditTransaction]:', error);
        throw error;
    }
};

/**
 * @description Retrieves all credit transactions for a specific user.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<Array<object>>} A list of credit transactions.
 */
const getCreditTransactionsByUserId = async (userId) => {
    try {
        const query = 'SELECT * FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC;';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error(`[Credit Transaction Repository Error - getCreditTransactionsByUserId ${userId}]:`, error);
        throw error;
    }
};

module.exports = {
    createCreditTransaction,
    getCreditTransactionsByUserId,
};
