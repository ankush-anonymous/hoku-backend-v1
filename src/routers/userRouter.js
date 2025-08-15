// user.router.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userValidator = require('../validators/userValidator');

// Define the routes for the /users endpoint

/**
 * @route   POST /api/users/createUser
 * @desc    Create a new user
 * @access  Public
 */
router.post(
    '/createUser',
    userValidator.validateCreateUser, // Middleware to validate request body
    userController.createUser
);


/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
    '/login',
    userValidator.validateLogin, // Middleware to validate login payload
    userController.loginUser
);

/**
 * @route   GET /api/users/getAllUsers
 * @desc    Get all active users
 * @access  Public (or Protected, depending on your app's needs)
 */
router.get(
    '/getAllUsers',
    userController.getAllUsers
);

/**
 * @route   GET /api/users/getUserById/:id
 * @desc    Get a single user by their UUID
 * @access  Public (or Protected)
 */
router.get(
    '/getUserById/:id',
    userController.getUserById
);

/**
 * @route   GET /api/users/getUserByEmail/:email
 * @desc    Get a single user by their email
 * @access  Public (or Protected)
 */
router.get(
    '/getUserByEmail/:email',
    userController.getUserByEmail
);

/**
 * @route   PUT /api/users/updateUserById/:id
 * @desc    Update a user's information
 * @access  Protected (typically only the user themselves or an admin)
 */
router.put(
    '/updateUserById/:id',
    userValidator.validateUpdateUser, // Middleware to validate request body
    userController.updateUserById
);

/**
 * @route   DELETE /api/users/deleteUserById/:id
 * @desc    Delete a user (soft delete)
 * @access  Protected (typically only the user themselves or an admin)
 */
router.delete(
    '/deleteUserById/:id',
    userController.deleteUserById
);

/**
 * @route   DELETE /api/users/hard-delete/:id
 * @desc    Permanently delete a user (hard delete)
 * @access  Protected (typically only an admin)
 */
router.delete(
    '/hard-delete/:id',
    userController.hardDeleteUserById
);

module.exports = router;
