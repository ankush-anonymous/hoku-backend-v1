const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/razorpayPaymentController");
// const paymentValidator = require("../validators/payment.validator");

// Create an order
router.post("/create-order",  paymentController.createOrder);

// Verify payment signature
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;
