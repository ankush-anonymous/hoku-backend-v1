const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new feature.
 * @param {object} featureData - { feature_code, name, credit_cost }
 * @returns {Promise<object>} The newly created feature.
 */
const createFeature = async (featureData) => {
    try {
        const { feature_code, name, credit_cost } = featureData;
        const query = `
            INSERT INTO features (feature_code, name, credit_cost)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [feature_code, name, credit_cost];
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('[Feature Repository Error - createFeature]:', error);
        throw error;
    }
};

/**
 * @description Retrieves all active features.
 * @returns {Promise<Array<object>>} A list of all active features.
 */
const getAllFeatures = async () => {
    try {
        const query = 'SELECT * FROM features WHERE is_active = TRUE;';
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('[Feature Repository Error - getAllFeatures]:', error);
        throw error;
    }
};

/**
 * @description Retrieves a single active feature by its ID.
 * @param {number} id - The serial ID of the feature.
 * @returns {Promise<object|null>} The feature object or null if not found.
 */
const getFeatureById = async (id) => {
    try {
        const query = 'SELECT * FROM features WHERE id = $1 AND is_active = TRUE;';
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Feature Repository Error - getFeatureById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Updates a feature's information by its ID.
 * @param {number} id - The ID of the feature to update.
 * @param {object} updates - { name, credit_cost, is_active }
 * @returns {Promise<object|null>} The updated feature object.
 */
const updateFeatureById = async (id, updates) => {
    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return getFeatureById(id);
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
        const query = `
            UPDATE features
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = TRUE
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Feature Repository Error - updateFeatureById ${id}]:`, error);
        throw error;
    }
};

/**
 * @description Deletes a feature by its ID (soft delete).
 * @param {number} id - The ID of the feature to delete.
 * @returns {Promise<object|null>} The feature object marked as inactive.
 */
const deleteFeatureById = async (id) => {
    try {
        const query = `
            UPDATE features
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = TRUE
            RETURNING id, is_active;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`[Feature Repository Error - deleteFeatureById ${id}]:`, error);
        throw error;
    }
};

module.exports = {
    createFeature,
    getAllFeatures,
    getFeatureById,
    updateFeatureById,
    deleteFeatureById,
};
