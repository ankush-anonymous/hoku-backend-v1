const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const planValidator = require('../validators/planValidator');

// POST /api/plans - Create a new plan
router.post(
    '/',
    planValidator.validateCreatePlan,
    planController.createPlan
);

// GET /api/plans - Get all plans (can filter by productId)
router.get(
    '/',
    planController.getAllPlans
);

// GET /api/plans/:id - Get a plan by ID
router.get(
    '/:id',
    planController.getPlanById
);

// PUT /api/plans/:id - Update a plan
router.put(
    '/:id',
    planValidator.validateUpdatePlan,
    planController.updatePlanById
);

// DELETE /api/plans/:id - Delete a plan
router.delete(
    '/:id',
    planController.deletePlanById
);

module.exports = router;