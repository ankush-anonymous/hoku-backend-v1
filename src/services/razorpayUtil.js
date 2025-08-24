const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // from Razorpay Dashboard
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpayInstance;
