const { validationResult } = require("express-validator");
const razorpay = require("../services/razorpayUtil");
const paymentRepo = require("../repositories/razorpayPaymentRepository");
const planRepo = require("../repositories/planRepository"); // ⬅️ Import Plan repo
const crypto = require("crypto");

// ✅ Updated createOrder to use plan_id
exports.createOrder = async (req, res) => {
  try {
    const { plan_id, user_id } = req.body;

    if (!plan_id || !user_id) {
      return res.status(400).json({ success: false, message: "plan_id and user_id are required" });
    }

    // 1. Get plan from DB
    const plan = await planRepo.getPlanById(plan_id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // 2. Prepare Razorpay order
    const options = {
      amount: Math.round(parseFloat(plan.price) * 100), // Razorpay expects paise
      currency: plan.currency || "INR",
      receipt: `receipt_${Date.now()}_${user_id}`,
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        user_id,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 3. Save order in DB
    const savedOrder = await paymentRepo.saveOrder({
      user_id,
      plan_id: plan.id,
      razorpay_order_id: razorpayOrder.id,
      amount: plan.price,
      currency: plan.currency,
      status: razorpayOrder.status,
    });

    res.json({
      success: true,
      order: razorpayOrder, // From Razorpay
      dbOrder: savedOrder,  // From DB
      plan: {
        id: plan.id,
        name: plan.name,
        credits_granted: plan.credits_granted,
      },
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// verifyPayment stays same
exports.verifyPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ Verified
      await paymentRepo.savePaymentSuccess(req.body);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
