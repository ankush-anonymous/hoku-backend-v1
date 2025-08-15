// wardrobe.repository.js
const { pool } = require("../infrastructure/PgDB/connect"); // Assuming your pool connection is here

/**
 * @description Creates a new wardrobe in the database.
 * @param {object} wardrobeData - The wardrobe data to create.
 * @returns {Promise<object>} The newly created wardrobe.
 */
const createWardrobe = async (wardrobeData) => {
  const { user_id, name, intent, lifestyle, negative_pref } = wardrobeData;
  const query = `
    INSERT INTO wardrobes (user_id, name, intent, lifestyle, negative_pref)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [user_id, name, intent, lifestyle, negative_pref];
  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Repository Error: Could not create wardrobe.', error);
    throw new Error('Database error during wardrobe creation.');
  }
};

/**
 * @description Retrieves all wardrobes from the database.
 * @returns {Promise<Array<object>>} A list of all wardrobes.
 */
const getAllWardrobes = async () => {
  const query = 'SELECT * FROM wardrobes;';
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Repository Error: Could not retrieve all wardrobes.', error);
    throw new Error('Database error while retrieving all wardrobes.');
  }
};

/**
 * @description Retrieves a single wardrobe by its ID.
 * @param {string} id - The UUID of the wardrobe.
 * @returns {Promise<object|null>} The wardrobe object or null if not found.
 */
const getWardrobeById = async (id) => {
  const query = 'SELECT * FROM wardrobes WHERE id = $1;';
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Repository Error: Could not get wardrobe by ID ${id}.`, error);
    throw new Error('Database error while retrieving wardrobe by ID.');
  }
};

/**
 * @description Retrieves all wardrobes for a specific user.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<Array<object>>} A list of the user's wardrobes.
 */
const getWardrobesByUserId = async (userId) => {
  const query = 'SELECT * FROM wardrobes WHERE user_id = $1 ORDER BY created_at;';
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error(`Repository Error: Could not get wardrobes for user ID ${userId}.`, error);
    throw new Error('Database error while retrieving wardrobes by user ID.');
  }
};

/**
 * @description Finds the default "All Dresses" wardrobe for a user.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<object|null>} The default wardrobe object or null.
 */
const findDefaultWardrobeByUserId = async (userId) => {
  const query = 'SELECT id FROM wardrobes WHERE user_id = $1 AND name = $2 LIMIT 1;';
  try {
    const { rows } = await pool.query(query, [userId, 'Your Dresses']);
    return rows[0] || null;
  } catch (error) {
    console.error(`Repository Error: Could not find default wardrobe for user ${userId}.`, error);
    throw new Error('Database error while finding default wardrobe.');
  }
};

/**
 * @description Updates a wardrobe's information by its ID.
 * @param {string} id - The UUID of the wardrobe to update.
 * @param {object} updates - An object with the fields to update.
 * @returns {Promise<object|null>} The updated wardrobe object or null if not found.
 */
const updateWardrobeById = async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
        return getWardrobeById(id);
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
    
    const query = `
        UPDATE wardrobes
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    try {
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Repository Error: Could not update wardrobe by ID ${id}.`, error);
        throw new Error('Database error during wardrobe update.');
    }
};

/**
 * @description Deletes a wardrobe from the database by its ID.
 * @param {string} id - The UUID of the wardrobe to delete.
 * @returns {Promise<object|null>} The wardrobe object that was deleted.
 */
const deleteWardrobeById = async (id) => {
    const query = 'DELETE FROM wardrobes WHERE id = $1 RETURNING *;';
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Repository Error: Could not delete wardrobe by ID ${id}.`, error);
        throw new Error('Database error during wardrobe deletion.');
    }
};

module.exports = {
  createWardrobe,
  getAllWardrobes,
  getWardrobeById,
  getWardrobesByUserId,
  findDefaultWardrobeByUserId, // Added for the new logic
  updateWardrobeById,
  deleteWardrobeById,
};
