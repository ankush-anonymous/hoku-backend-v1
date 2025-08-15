const express = require('express');
const router = express.Router();

// Import the controller and the validation middleware
const UserActionsLogController = require('../controllers/userActivityController');
const { validateUserActionLog } = require('../validators/userActivityValidator');

// POST /api/logs/createAction - Create a new user action log
router.post(
  '/createAction',
  validateUserActionLog,
  UserActionsLogController.createLog
);

// GET /api/logs/getAllActions - Get all user action logs
router.get(
    '/getAllActions',
    UserActionsLogController.getAllLogs
);

// GET /api/logs/getActionById/:id - Get a single log by its ID
router.get(
    '/getActionById/:id',
    UserActionsLogController.getLogById
);

// GET /api/logs/getActionsByUserId/:userId - Get all logs for a specific user
router.get(
    '/getActionsByUserId/:userId',
    UserActionsLogController.getLogsByUserId
);

// DELETE /api/logs/deleteActionById/:id - Delete a log by its ID
router.delete(
    '/deleteActionById/:id',
    UserActionsLogController.deleteLogById
);

// DELETE /api/logs/deleteAllActions - Delete all logs (use with caution)
router.delete(
    '/deleteAllActions',
    UserActionsLogController.deleteAllLogs
);


module.exports = router;
