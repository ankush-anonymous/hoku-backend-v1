const paymentRepository = require('../repositories/paymentRepository');

const createPayment = async (req, res) => {
    try {
        const newPayment = await paymentRepository.createPayment(req.body);
        res.status(201).json(newPayment);
    } catch (error) {
        console.error('[Payment Controller Error - createPayment]:', error);
        res.status(500).json({ message: "Error creating payment", error: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const { userId } = req.query;
        const payments = await paymentRepository.getAllPayments(userId);
        res.status(200).json(payments);
    } catch (error) {
        console.error('[Payment Controller Error - getAllPayments]:', error);
        res.status(500).json({ message: "Error retrieving payments", error: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentRepository.getPaymentById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error('[Payment Controller Error - getPaymentById]:', error);
        res.status(500).json({ message: "Error retrieving payment", error: error.message });
    }
};

const updatePaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPayment = await paymentRepository.updatePaymentById(id, req.body);
        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found or nothing to update" });
        }
        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error('[Payment Controller Error - updatePaymentById]:', error);
        res.status(500).json({ message: "Error updating payment", error: error.message });
    }
};

const deletePaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPayment = await paymentRepository.deletePaymentById(id);
        if (!deletedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json({ message: "Payment deleted successfully", payment: deletedPayment });
    } catch (error) {
        console.error('[Payment Controller Error - deletePaymentById]:', error);
        res.status(500).json({ message: "Error deleting payment", error: error.message });
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentById,
    deletePaymentById,
};
