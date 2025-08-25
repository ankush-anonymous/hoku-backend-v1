const creditTransactionRepository = require('../repositories/creditTransactionRepository');

const createCreditTransaction = async (req, res) => {
    try {
        const newTransaction = await creditTransactionRepository.createCreditTransaction(req.body);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: "Error creating credit transaction", error: error.message });
    }
};

const getCreditTransactionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await creditTransactionRepository.getCreditTransactionsByUserId(userId);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving credit transactions", error: error.message });
    }
};

const getAllTransactionsAndPaymentsByPlan = async (req, res) => {
    try {
        const transactions = await creditTransactionRepository.getAllTransactionsAndPaymentsByPlan();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving transactions and payments by plan", error: error.message });
    }
};

module.exports = {
    createCreditTransaction,
    getCreditTransactionsByUserId,
    getAllTransactionsAndPaymentsByPlan,
};
