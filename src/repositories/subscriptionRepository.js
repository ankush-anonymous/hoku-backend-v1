const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new subscription.
 * @param {object} subData - The subscription data.
 * @returns {Promise<object>} The newly created subscription.
 */
const createSubscription = async (subData) => {
    try {
        const {
            user_id,
            plan_id,
            razorpay_subscription_id,
            status,
            current_period_start,
            current_period_end,
            trial_ends_at,
        } = subData;

        const query = `
            INSERT INTO subscriptions (user_id, plan_id, razorpay_subscription_id, status, current_period_start, current_period_end, trial_ends_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [user_id, plan_id, razorpay_subscription_id, status, current_period_start, current_period_end, trial_ends_at];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('[Subscription Repository Error - createSubscription]:', error);
        throw error; // Re-throw the error to be caught by the controller
    }
};

/**
 * @description Retrieves all subscriptions, optionally filtered by user_id.
 * @param {string} [userId] - Optional user UUID to filter subscriptions by.
 * @returns {Promise<Array<object>>} A list of subscriptions.
 */
const getAllSubscriptions = async (userId) => {
    try {
        let query = 'SELECT * FROM subscriptions';
        const values = [];

        if (userId) {
            query += ' WHERE user_id = $1';
            values.push(userId);
        }
        
        query += ' ORDER BY created_at DESC;';

        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('[Subscription Repository Error - getAllSubscriptions]:', error);
        throw error;
    }
};

/**
 * @description Retrieves a single subscription by its ID.
 * @param {string} id - The UUID of the subscription.
 * @returns {Promise<object|null>} The subscription object or null if not found.
 */
const getSubscriptionById = async (id) => {
    try {
        const query = 'SELECT * FROM subscriptions WHERE id = $1;';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Subscription Repository Error - getSubscriptionById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Retrieves all subscriptions for a specific user.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<Array<object>>} A list of subscription objects.
 */
const getSubscriptionsByUserId = async (userId) => {
    try {
        const query = 'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC;';
        const { rows } = await pool.query(query, [userId]);
        return rows; // A user can have multiple subscriptions
    } catch (error) {
        console.error(`[Subscription Repository Error - getSubscriptionsByUserId ${userId}]:`, error);
        throw error;
    }
};


/**
 * @description Updates a subscription's information by its ID.
 * @param {string} id - The UUID of the subscription to update.
 * @param {object} updates - An object with the fields to update.
 * @returns {Promise<object|null>} The updated subscription object.
 */
const updateSubscriptionById = async (id, updates) => {
    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return getSubscriptionById(id);
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const query = `
            UPDATE subscriptions
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Subscription Repository Error - updateSubscriptionById ${id}]:`, error);
        throw error;
    }
};

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getSubscriptionsByUserId,
    updateSubscriptionById,
};
