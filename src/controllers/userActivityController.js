const UserActionsLogRepository = require('../repositories/userActivityRepository');

/**
 * The controller is responsible for handling the request/response cycle
 * and providing a reusable service for logging actions.
 */
class UserActionsLogController {
  /**
   * A reusable, internal method to create a log entry.
   * This function does NOT handle req/res and can be called directly
   * from other controllers or services.
   * @param {object} logData - The complete data object for the log entry.
   * @returns {Promise<object>} The created log object.
   * @throws {Error} Throws an error if the database operation fails.
   */
  async logAction(logData) {
    try {
      // This method contains the core logic to create a log.
      const newLog = await UserActionsLogRepository.create(logData);
      console.log(`Action logged successfully: ${logData.action_type} for user ${logData.user_id}`);
      return newLog;
    } catch (error) {
      // Log the error here for centralized debugging, but re-throw it
      // so the original calling function knows the operation failed.
      console.error('Core Logging Error: Could not create user action log.', error.message);
      throw error;
    }
  }

  /**
   * Handles the HTTP request to create a new user action log.
   * This is now a thin wrapper around the internal logAction method.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async createLog(req, res) {
    try {
      // The request body is the logData object.
      // We call the internal method to perform the action.
      const newLog = await this.logAction(req.body);
      res.status(201).json({ message: 'User action logged successfully.', data: newLog });
    } catch (error) {
      // The error is already logged by logAction, so we just send the response.
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }

  /**
   * Handles retrieving all user action logs.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async getAllLogs(req, res) {
    try {
      const logs = await UserActionsLogRepository.getAll();
      res.status(200).json({ message: 'Logs retrieved successfully.', data: logs });
    } catch (error) {
      console.error('Controller Error: Could not retrieve logs.', error.message);
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }

  /**
   * Handles retrieving a single log by its ID.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async getLogById(req, res) {
    try {
      const { id } = req.params;
      const log = await UserActionsLogRepository.getById(id);
      if (!log) {
        return res.status(404).json({ message: 'Log not found.' });
      }
      res.status(200).json({ message: 'Log retrieved successfully.', data: log });
    } catch (error) {
      console.error('Controller Error: Could not retrieve log by ID.', error.message);
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }

  /**
   * Handles retrieving all logs for a specific user.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async getLogsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const logs = await UserActionsLogRepository.getByUserId(userId);
      res.status(200).json({ message: 'User logs retrieved successfully.', data: logs });
    } catch (error) {
      console.error('Controller Error: Could not retrieve logs by user ID.', error.message);
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }

  /**
   * Handles deleting a log by its ID.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async deleteLogById(req, res) {
    try {
      const { id } = req.params;
      const deletedLog = await UserActionsLogRepository.deleteById(id);
      if (!deletedLog) {
        return res.status(404).json({ message: 'Log not found.' });
      }
      res.status(200).json({ message: 'Log deleted successfully.', data: deletedLog });
    } catch (error) {
      console.error('Controller Error: Could not delete log by ID.', error.message);
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }

  /**
   * Handles deleting all logs.
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async deleteAllLogs(req, res) {
    try {
      const deletedCount = await UserActionsLogRepository.deleteAll();
      res.status(200).json({ message: `Successfully deleted ${deletedCount} logs.` });
    } catch (error) {
      console.error('Controller Error: Could not delete all logs.', error.message);
      res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
  }
}

module.exports = new UserActionsLogController();
