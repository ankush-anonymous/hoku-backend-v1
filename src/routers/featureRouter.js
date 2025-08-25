const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');
const featureValidator = require('../validators/featureValidator');

// POST /api/features - Create a new feature
router.post(
    '/createFeature',
    featureValidator.validateCreateFeature,
    featureController.createFeature
);

// GET /api/features - Get all features
router.get(
    '/getAllFeatures',
    featureController.getAllFeatures
);

// GET /api/features/:id - Get a feature by ID
router.get(
    '/getFeatureById/:id',
    featureController.getFeatureById
);

// PUT /api/features/:id - Update a feature
router.put(
    '/updateFeatureById/:id',
    featureValidator.validateUpdateFeature,
    featureController.updateFeatureById
);

// DELETE /api/features/:id - Delete a feature
router.delete(
    '/deleteFeatureById/:id',
    featureController.deleteFeatureById
);

module.exports = router;
