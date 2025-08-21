// src/repositories/eventNameRepository.js

const { pool } = require("../infrastructure/PgDB/connect"); // Adjust path to your DB connection

/**
 * Creates a new event name in the database.
 * @param {string} name - The name of the event (e.g., "Wedding Guest").
 * @returns {Promise<object>} The newly created event name object.
 */
const createEventName = async (name) => {
  const query = `
    INSERT INTO function_occasion (name) 
    VALUES ($1) 
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [name]);
    return rows[0];
  } catch (error) {
    console.error('Error creating event name:', error);
    throw error;
  }
};

/**
 * Retrieves all event names from the database, ordered alphabetically.
 * @returns {Promise<Array<object>>} A list of all event name objects.
 */
const getAllEventNames = async () => {
  const query = `
    SELECT * FROM function_occasion 
    ORDER BY name ASC;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error retrieving all event names:', error);
    throw error;
  }
};

/**
 * Deletes an event name by its ID.
 * @param {string} id - The UUID of the event name to delete.
 * @returns {Promise<object|null>} The deleted event object or null if not found.
 */
const deleteEventNameById = async (id) => {
  const query = `
    DELETE FROM function_occasion 
    WHERE id = $1 
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Error deleting event name with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  createEventName,
  getAllEventNames,
  deleteEventNameById,
};