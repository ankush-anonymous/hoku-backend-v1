// user.repository.js
const { pool } = require("../infrastructure/PgDB/connect"); // Assuming your pool connection is here

/**
 * @description Creates a new user in the database.
 * @param {object} userData - The user data to create.
 * @returns {Promise<object>} The newly created user.
 */
const createUser = async (userData) => {
  const {
    name,
    phone_number,
    email_id,
    password,
    gender,
    date_of_birth,
    colour_tone,
    undertone,
    body_type,
    height_range, 
    weight_range, 
    top_size,     
    bottom_size   
  } = userData;

  const query = `
    INSERT INTO users (name, phone_number, email_id, password, gender, date_of_birth, colour_tone, undertone, body_type, height_range, weight_range, top_size, bottom_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  const values = [name, phone_number, email_id, password, gender, date_of_birth, colour_tone, undertone, body_type, height_range, weight_range, top_size, bottom_size];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * @description Retrieves all active users from the database.
 * @returns {Promise<Array<object>>} A list of all users.
 */
const getAllUsers = async () => {
  const query = 'SELECT * FROM users WHERE is_active = TRUE;';
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * @description Retrieves a single active user by their ID.
 * @param {string} id - The UUID of the user.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
const getUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1 AND is_active = TRUE;';
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Error getting user by ID ${id}:`, error);
    throw error;
  }
};

/**
 * @description Retrieves a single active user by their email address for general use.
 * @param {string} email - The email of the user.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email_id = $1 AND is_active = TRUE;';
    try {
        const { rows } = await pool.query(query, [email]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Error getting user by email ${email}:`, error);
        throw error;
    }
};

/**
 * @description Retrieves a user by email for authentication purposes, including the password.
 * @param {string} email - The email of the user.
 * @returns {Promise<object|null>} The full user object, including password hash.
 */
const findUserByEmailForAuth = async (email) => {
    const query = 'SELECT * FROM users WHERE email_id = $1;';
    try {
        const { rows } = await pool.query(query, [email]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Error finding user by email for auth: ${email}.`, error);
        throw error;
    }
};


/**
 * @description Updates a user's information by their ID.
 * @param {string} id - The UUID of the user to update.
 * @param {object} updates - An object with the fields to update.
 * @returns {Promise<object|null>} The updated user object or null if not found.
 */
const updateUserById = async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
        return getUserById(id);
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
    
    const query = `
        UPDATE users
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING *;
    `;

    try {
        const { rows } = await pool.query(query, [id, ...values]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Error updating user by ID ${id}:`, error);
        throw error;
    }
};

/**
 * @description Deletes a user by their ID (soft delete).
 * @param {string} id - The UUID of the user to delete.
 * @returns {Promise<object|null>} The user object that was marked as inactive.
 */
const deleteUserById = async (id) => {
    const query = `
        UPDATE users
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING id, is_active;
    `;
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Error deleting user by ID ${id}:`, error);
        throw error;
    }
};

/**
 * @description Permanently deletes a user from the database by their ID.
 * @param {string} id - The UUID of the user to permanently delete.
 * @returns {Promise<object|null>} The user object that was deleted.
 */
const hardDeleteUserById = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING *;
    `;
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error(`Error permanently deleting user by ID ${id}:`, error);
        throw error;
    }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  findUserByEmailForAuth,
  updateUserById,
  deleteUserById,
  hardDeleteUserById,
};
