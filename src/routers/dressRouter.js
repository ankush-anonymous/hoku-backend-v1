// dress.router.js
const express = require('express');
const router = express.Router();
const dressController = require('../controllers/dressController');
// Import the new validator
const dressValidator = require('../validators/dressValidator');

/**
 * @route   POST /api/v1/dresses/addDress
 * @desc    Create a new dress and link it to a wardrobe.
 * @access  Protected
 */
router.post(
    '/addDress',
    dressValidator.validateAddDress, // Using the new validator
    dressController.addDress
);

/**
 * @route   GET /api/v1/dresses/getDressById/:id
 * @desc    Get a single dress by its MongoDB ID.
 * @access  Protected
 */
router.get(
    '/getDressById/:id',
    dressController.getDressById
);

/**
 * @route   GET /api/v1/dresses/getDressesByUserId/:userId
 * @desc    Get all dresses for a specific user.
 * @access  Protected
 */
router.get(
    '/getDressesByUserId/:userId',
    dressController.getDressesByUserId
);

/**
 * @route   GET /api/v1/dresses/getDressesByWardrobeId/:wardrobeId
 * @desc    Get all dresses within a specific wardrobe.
 * @access  Protected
 */
router.get(
    '/getDressesByWardrobeId/:wardrobeId',
    dressController.getDressesByWardrobeId
);

/**
 * @route   PUT /api/v1/dresses/updateDressById/:id
 * @desc    Update a dress's information by its MongoDB ID.
 * @access  Protected
 */
router.put(
    '/updateDressById/:id',
    dressValidator.validateUpdateDress, // Using the new validator
    dressController.updateDressById
);

/**
 * @route   DELETE /api/v1/dresses/deleteDressById/:id
 * @desc    Permanently delete a dress from the database.
 * @access  Protected
 */
router.delete(
    '/deleteDressById/:id',
    dressController.deleteDressById
);

/**
 * @route   DELETE /api/v1/dresses/removeDressFromWardrobe/:wardrobeId/:dressId
 * @desc    Remove a dress from a specific wardrobe (unlinks it).
 * @access  Protected
 */
router.delete(
    '/removeDressFromWardrobe/:wardrobeId/:dressId',
    dressController.removeDressFromWardrobe
);

module.exports = router;
