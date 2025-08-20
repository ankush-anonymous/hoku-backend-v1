// wardrobeOutfits.repository.js
const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a link between a wardrobe and an outfit.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @param {string} outfitIdMongo - The ID of the outfit from MongoDB.
 * @returns {Promise<object>} The newly created link record.
 */
const linkOutfitToWardrobe = async (wardrobeId, outfitIdMongo) => {
    const query = `
        INSERT INTO wardrobes_outfit (wardrobe_id, outfit_id_mongo)
        VALUES ($1, $2)
        ON CONFLICT (wardrobe_id, outfit_id_mongo) DO NOTHING
        RETURNING *;
    `;
    try {
        const { rows } = await pool.query(query, [wardrobeId, outfitIdMongo]);
        return rows[0];
    } catch (error) {
        console.error('Repository Error: Could not link outfit to wardrobe.', error);
        throw new Error('Database error when creating wardrobe-outfit link.');
    }
};

/**
 * @description Retrieves all outfit IDs associated with a single wardrobe.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @returns {Promise<Array<string>>} An array of MongoDB outfit IDs.
 */
const getOutfitIdsByWardrobeId = async (wardrobeId) => {
    const query = 'SELECT outfit_id_mongo FROM wardrobes_outfit WHERE wardrobe_id = $1;';
    try {
        const { rows } = await pool.query(query, [wardrobeId]);
        return rows.map(row => row.outfit_id_mongo);
    } catch (error) {
        console.error(`Repository Error: Could not get outfits for wardrobe ${wardrobeId}.`, error);
        throw new Error('Database error while fetching outfits for wardrobe.');
    }
};

/**
 * @description Removes a link between a specific wardrobe and outfit.
 * @param {string} wardrobeId - The UUID of the wardrobe.
 * @param {string} outfitIdMongo - The ID of the outfit from MongoDB.
 * @returns {Promise<object|null>} The deleted link record, or null if it didn't exist.
 */
const unlinkOutfitFromWardrobe = async (wardrobeId, outfitIdMongo) => {
    const query = 'DELETE FROM wardrobes_outfit WHERE wardrobe_id = $1 AND outfit_id_mongo = $2 RETURNING *;';
    try {
        const { rows } = await pool.query(query, [wardrobeId, outfitIdMongo]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Repository Error: Could not unlink outfit ${outfitIdMongo} from wardrobe ${wardrobeId}.`, error);
        throw new Error('Database error while unlinking outfit from wardrobe.');
    }
};

/**
 * @description Removes all links associated with a specific outfit ID.
 * This is a crucial cleanup step when an outfit is permanently deleted.
 * @param {string} outfitIdMongo - The ID of the outfit from MongoDB.
 * @returns {Promise<number>} The number of links that were deleted.
 */
const unlinkAllInstancesOfOutfit = async (outfitIdMongo) => {
    const query = 'DELETE FROM wardrobes_outfit WHERE outfit_id_mongo = $1;';
    try {
        const result = await pool.query(query, [outfitIdMongo]);
        return result.rowCount; // Returns the number of deleted rows
    } catch (error) {
        console.error(`Repository Error: Could not unlink all instances of outfit ${outfitIdMongo}.`, error);
        throw new Error('Database error while cleaning up outfit links.');
    }
};

module.exports = {
    linkOutfitToWardrobe,
    getOutfitIdsByWardrobeId,
    unlinkOutfitFromWardrobe,
    unlinkAllInstancesOfOutfit,
};