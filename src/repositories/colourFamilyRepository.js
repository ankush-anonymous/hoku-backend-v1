// src/repositories/colourFamilyRepository.js

const { pool } = require("../infrastructure/PgDB/connect");

/**
 * Creates a new colour family.
 * @param {string} name - The name of the color (e.g., "Primary Red").
 * @param {string} hex_value - The hex value of the color (e.g., '#FF5733').
 * @returns {Promise<object>} The newly created colour family object.
 */
const createColourFamily = async (name, hex_value) => {
  const query = `
    INSERT INTO colour_family (name, hex_value) 
    VALUES ($1, $2) 
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [name, hex_value]);
    return rows[0];
  } catch (error) {
    console.error('Error creating colour family:', error);
    throw error;
  }
};

/**
 * Retrieves all colour families from the database.
 * @returns {Promise<Array<object>>} A list of all colour families.
 */
const getAllColourFamilies = async () => {
  const query = `
    SELECT * FROM colour_family 
    ORDER BY name ASC;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error retrieving all colour families:', error);
    throw error;
  }
};

/**
 * Deletes a colour family by its ID.
 * @param {string} id - The UUID of the colour family to delete.
 * @returns {Promise<object|null>} The deleted object or null if not found.
 */
const deleteColourFamilyById = async (id) => {
  const query = `
    DELETE FROM colour_family 
    WHERE id = $1 
    RETURNING *;
  `;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Error deleting colour family with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  createColourFamily,
  getAllColourFamilies, // Added the new function here
  deleteColourFamilyById,
};