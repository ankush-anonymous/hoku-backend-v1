// This file assumes you have a central database connection pool setup.
// For example, in a file like 'db.js' or 'database.js'
const { pool } = require("../infrastructure/PgDB/connect"); // Assuming your pool connection is here

/**
 * The repository handles all database operations for the user_actions_log table.
 * It abstracts the SQL queries away from the controller.
 */
class UserActionsLogRepository {
  /**
   * Inserts a new user action log into the database.
   * @param {object} logData - The data for the new log entry.
   * @returns {Promise<object>} The newly created log entry.
   */
  async create(logData) {
    const {
      user_id,
      action_type,
      source_feature,
      target_entity_type,
      target_entity_id,
      status,
      metadata,
    } = logData;

    const query = `
      INSERT INTO user_actions_log (
        user_id, action_type, source_feature, target_entity_type,
        target_entity_id, status, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      user_id,
      action_type,
      source_feature || null,
      target_entity_type || null,
      target_entity_id || null,
      status,
      metadata ? JSON.stringify(metadata) : null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Repository Error: Failed to create user action log.', error);
      throw new Error('An error occurred while logging the user action.');
    }
  }

  /**
   * Retrieves all user action logs from the database.
   * @returns {Promise<Array<object>>} A list of all log entries.
   */
  async getAll() {
    const query = 'SELECT * FROM user_actions_log ORDER BY created_at DESC;';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Repository Error: Failed to get all user action logs.', error);
      throw new Error('An error occurred while retrieving logs.');
    }
  }

  /**
   * Retrieves a single user action log by its primary key (ID).
   * @param {string} id - The UUID of the log entry.
   * @returns {Promise<object|null>} The log entry if found, otherwise null.
   */
  async getById(id) {
    const query = 'SELECT * FROM user_actions_log WHERE id = $1;';
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Repository Error: Failed to get user action log by ID.', error);
      throw new Error('An error occurred while retrieving the log.');
    }
  }

  /**
   * Retrieves all logs for a specific user.
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<Array<object>>} A list of log entries for the specified user.
   */
  async getByUserId(userId) {
    const query = 'SELECT * FROM user_actions_log WHERE user_id = $1 ORDER BY created_at DESC;';
    const values = [userId];
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Repository Error: Failed to get logs by user ID.', error);
      throw new Error('An error occurred while retrieving user logs.');
    }
  }

  /**
   * Deletes a single user action log by its ID.
   * @param {string} id - The UUID of the log entry to delete.
   * @returns {Promise<object|null>} The deleted log entry, or null if not found.
   */
  async deleteById(id) {
    const query = 'DELETE FROM user_actions_log WHERE id = $1 RETURNING *;';
    const values = [id];
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Repository Error: Failed to delete log by ID.', error);
      throw new Error('An error occurred while deleting the log.');
    }
  }

  /**
   * Deletes all user action logs from the table.
   * @returns {Promise<number>} The number of rows deleted.
   */
  async deleteAll() {
    const query = 'DELETE FROM user_actions_log;';
    try {
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('Repository Error: Failed to delete all logs.', error);
      throw new Error('An error occurred while deleting all logs.');
    }
  }
}

module.exports = new UserActionsLogRepository();
