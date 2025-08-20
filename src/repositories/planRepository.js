const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new plan.
 * @param {object} planData - The plan data to create.
 * @returns {Promise<object>} The newly created plan.
 */
const createPlan = async (planData) => {
    try {
        const {
            product_id,
            razorpay_plan_id,
            name,
            type,
            price,
            currency,
            billing_interval,
            interval_count,
            credits_granted,
        } = planData;

        const query = `
            INSERT INTO plans (product_id, razorpay_plan_id, name, type, price, currency, billing_interval, interval_count, credits_granted)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [product_id, razorpay_plan_id, name, type, price, currency, billing_interval, interval_count, credits_granted];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('[Plan Repository Error - createPlan]:', error);
        throw error;
    }
};

/**
 * @description Retrieves all active plans, optionally filtered by product_id.
 * @param {string} [productId] - Optional product UUID to filter plans by.
 * @returns {Promise<Array<object>>} A list of active plans.
 */
const getAllPlans = async (productId) => {
    try {
        let query = 'SELECT * FROM plans WHERE is_active = TRUE';
        const values = [];

        if (productId) {
            query += ' AND product_id = $1';
            values.push(productId);
        }
        
        query += ';';

        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('[Plan Repository Error - getAllPlans]:', error);
        throw error;
    }
};

/**
 * @description Retrieves a single active plan by its ID.
 * @param {string} id - The UUID of the plan.
 * @returns {Promise<object|null>} The plan object or null if not found.
 */
const getPlanById = async (id) => {
    try {
        const query = 'SELECT * FROM plans WHERE id = $1 AND is_active = TRUE;';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Plan Repository Error - getPlanById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Updates a plan's information by its ID.
 * @param {string} id - The UUID of the plan to update.
 * @param {object} updates - An object with the fields to update.
 * @returns {Promise<object|null>} The updated plan object.
 */
const updatePlanById = async (id, updates) => {
    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return getPlanById(id);
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const query = `
            UPDATE plans
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = TRUE
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Plan Repository Error - updatePlanById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Deletes a plan by its ID (soft delete).
 * @param {string} id - The UUID of the plan to delete.
 * @returns {Promise<object|null>} The plan object marked as inactive.
 */
const deletePlanById = async (id) => {
    try {
        const query = `
            UPDATE plans
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = TRUE
            RETURNING id, is_active;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Plan Repository Error - deletePlanById ${id}]:`, error);
        throw error;
    }
};

module.exports = {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlanById,
    deletePlanById,
};
