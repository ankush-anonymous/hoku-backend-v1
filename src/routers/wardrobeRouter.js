// wardrobe.router.js
const express = require('express');
const router = express.Router();
const wardrobeController = require('../controllers/wardrobeController');
const wardrobeValidator = require('../validators/wardrobeValidator');

/**
 * @route   POST /api/v1/wardrobes/createWardrobe
 * @desc    Create a new wardrobe
 * @access  Protected
 */
router.post(
    '/createWardrobe',
    wardrobeValidator.validateCreateWardrobe,
    wardrobeController.createWardrobe
);

/**
 * @route   GET /api/v1/wardrobes/getAllWardrobes
 * @desc    Get all wardrobes
 * @access  Protected (Admin)
 */
router.get(
    '/getAllWardrobes',
    wardrobeController.getAllWardrobes
);

/**
 * @route   GET /api/v1/wardrobes/getWardrobeById/:id
 * @desc    Get a single wardrobe by its ID
 * @access  Protected
 */
router.get(
    '/getWardrobeById/:id',
    wardrobeController.getWardrobeById
);

/**
 * @route   GET /api/v1/wardrobes/getWardrobesByUserId/:userId
 * @desc    Get all wardrobes for a specific user
 * @access  Protected
 */
router.get(
    '/getWardrobesByUserId/:userId',
    wardrobeController.getWardrobesByUserId
);

/**
 * @route   PUT /api/v1/wardrobes/updateWardrobeById/:id
 * @desc    Update a wardrobe's information
 * @access  Protected
 */
router.put(
    '/updateWardrobeById/:id',
    wardrobeValidator.validateUpdateWardrobe,
    wardrobeController.updateWardrobeById
);

/**
 * @route   DELETE /api/v1/wardrobes/deleteWardrobeById/:id
 * @desc    Delete a wardrobe
 * @access  Protected
 */
router.delete(
    '/deleteWardrobeById/:id',
    wardrobeController.deleteWardrobeById
);

module.exports = router;
