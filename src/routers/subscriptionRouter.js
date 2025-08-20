const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const subscriptionValidator = require('../validators/subscriptionValidator');

// POST /api/subscriptions - Create a new subscription
router.post(
    '/',
    subscriptionValidator.validateCreateSubscription,
    subscriptionController.createSubscription
);

// GET /api/subscriptions - Get all subscriptions (can filter by userId)
router.get(
    '/',
    subscriptionController.getAllSubscriptions
);

// GET /api/subscriptions/:id - Get a subscription by ID
router.get(
    '/:id',
    subscriptionController.getSubscriptionById
);

// PUT /api/subscriptions/:id - Update a subscription
router.put(
    '/:id',
    subscriptionValidator.validateUpdateSubscription,
    subscriptionController.updateSubscriptionById
);

module.exports = router;
