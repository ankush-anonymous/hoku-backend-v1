const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentValidator = require('../validators/paymentValidator');

// POST /api/payments - Create a new payment
router.post(
    '/',
    paymentValidator.validateCreatePayment,
    paymentController.createPayment
);

// GET /api/payments - Get all payments (can filter by userId)
router.get(
    '/',
    paymentController.getAllPayments
);

// GET /api/payments/:id - Get a payment by ID
router.get(
    '/:id',
    paymentController.getPaymentById
);

// PUT /api/payments/:id - Update a payment
router.put(
    '/:id',
    paymentValidator.validateUpdatePayment, // Added validator for the update payload
    paymentController.updatePaymentById
);

// DELETE /api/payments/:id - Delete a payment
router.delete(
    '/:id',
    paymentController.deletePaymentById
);

module.exports = router;
