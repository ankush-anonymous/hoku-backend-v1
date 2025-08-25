const express = require('express');
const router = express.Router();
const creditTransactionController = require('../controllers/creditTransactionController');
const creditTransactionValidator = require('../validators/creditTransactionValidator');

// POST /api/credit-transactions - Create a new credit transaction
router.post(
    '/createCreditTransaction',
    creditTransactionValidator.validateCreateCreditTransaction,
    creditTransactionController.createCreditTransaction
);

// GET /api/credit-transactions/user/:userId - Get all transactions for a user
router.get(
    '/getCreditTransactionsByUserId/:userId',
    creditTransactionController.getCreditTransactionsByUserId
);

router.get(
    '/getAllTransactionsAndPaymentsByPlan',
    creditTransactionController.getAllTransactionsAndPaymentsByPlan
);

module.exports = router;
