const express = require('express');
const router = express.Router();
const creditTransactionController = require('../controllers/creditTransactionController');
const creditTransactionValidator = require('../validators/creditTransactionValidator');

// POST /api/credit-transactions - Create a new credit transaction
router.post(
    '/',
    creditTransactionValidator.validateCreateCreditTransaction,
    creditTransactionController.createCreditTransaction
);

// GET /api/credit-transactions/user/:userId - Get all transactions for a user
router.get(
    '/user/:userId',
    creditTransactionController.getCreditTransactionsByUserId
);

module.exports = router;
