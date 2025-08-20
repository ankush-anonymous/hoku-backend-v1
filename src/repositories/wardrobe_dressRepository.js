// wardrobeDresses.repository.js
const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a link between a wardrobe and a dress.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @param {string} dressIdMongo - The ID of the dress from MongoDB.
 * @returns {Promise<object>} The newly created link record.
 */
const linkDressToWardrobe = async (wardrobeId, dressIdMongo) => {
    const query = `
        INSERT INTO wardrobe_dresses (wardrobe_id, dress_id_mongo)
        VALUES ($1, $2)
        ON CONFLICT (wardrobe_id, dress_id_mongo) DO NOTHING
        RETURNING *;
    `;
    try {
        const { rows } = await pool.query(query, [wardrobeId, dressIdMongo]);
        return rows[0];
    } catch (error) {
        console.error('Repository Error: Could not link dress to wardrobe.', error);
        throw new Error('Database error when creating wardrobe-dress link.');
    }
};

/**
 * @description Retrieves all dress IDs associated with a single wardrobe.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @returns {Promise<Array<string>>} An array of MongoDB dress IDs.
 */
const getDressIdsByWardrobeId = async (wardrobeId) => {
    const query = 'SELECT dress_id_mongo FROM wardrobe_dresses WHERE wardrobe_id = $1;';
    try {
        const { rows } = await pool.query(query, [wardrobeId]);
        return rows.map(row => row.dress_id_mongo);
    } catch (error) {
        console.error(`Repository Error: Could not get dresses for wardrobe ${wardrobeId}.`, error);
        throw new Error('Database error while fetching dresses for wardrobe.');
    }
};


/**
 * @description Checks if a specific dress is already linked to a specific wardrobe.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @param {string} dressIdMongo - The ID of the dress from MongoDB.
 * @returns {Promise<boolean>} True if the link exists, false otherwise.
 */
const checkDressInWardrobe = async (wardrobeId, dressIdMongo) => {
    // We use "SELECT 1" for efficiency as we only need to confirm existence, not retrieve data.
    const query = 'SELECT 1 FROM wardrobe_dresses WHERE wardrobe_id = $1 AND dress_id_mongo = $2;';
    try {
        const result = await pool.query(query, [wardrobeId, dressIdMongo]);
        // The rowCount will be 1 if the link is found, and 0 if it is not.
        return result.rowCount > 0;
    } catch (error) {
        console.error(`Repository Error: Could not check link for dress ${dressIdMongo} in wardrobe ${wardrobeId}.`, error);
        throw new Error('Database error while checking wardrobe-dress link.');
    }
};




/**
 * @description Removes a link between a specific wardrobe and dress.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @param {string} dressIdMongo - The ID of the dress from MongoDB.
 * @returns {Promise<object|null>} The deleted link record, or null if it didn't exist.
 */
const unlinkDressFromWardrobe = async (wardrobeId, dressIdMongo) => {
    const query = 'DELETE FROM wardrobe_dresses WHERE wardrobe_id = $1 AND dress_id_mongo = $2 RETURNING *;';
    try {
        const { rows } = await pool.query(query, [wardrobeId, dressIdMongo]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Repository Error: Could not unlink dress ${dressIdMongo} from wardrobe ${wardrobeId}.`, error);
        throw new Error('Database error while unlinking dress from wardrobe.');
    }
};

/**
 * @description Removes all links associated with a specific dress ID.
 * This is a crucial cleanup step when a dress is permanently deleted.
 * @param {string} dressIdMongo - The ID of the dress from MongoDB.
 * @returns {Promise<number>} The number of links that were deleted.
 */
const unlinkAllInstancesOfDress = async (dressIdMongo) => {
    const query = 'DELETE FROM wardrobe_dresses WHERE dress_id_mongo = $1;';
    try {
        const result = await pool.query(query, [dressIdMongo]);
        return result.rowCount; // Returns the number of deleted rows
    } catch (error) {
        console.error(`Repository Error: Could not unlink all instances of dress ${dressIdMongo}.`, error);
        throw new Error('Database error while cleaning up dress links.');
    }
};

module.exports = {
    linkDressToWardrobe,
    getDressIdsByWardrobeId,
    unlinkDressFromWardrobe,
    unlinkAllInstancesOfDress,
    checkDressInWardrobe
};
