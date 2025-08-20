const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation error',
            details: error.details.map(d => d.message),
        });
    }
    next();
};

const createPaymentSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    subscription_id: Joi.string().uuid().optional().allow(null),
    plan_id: Joi.string().uuid().optional().allow(null),
    razorpay_payment_id: Joi.string().max(255).required(),
    razorpay_order_id: Joi.string().max(255).required(),
    razorpay_signature: Joi.string().max(255).optional().allow(null, ''),
    amount: Joi.number().precision(2).required(),
    currency: Joi.string().max(10).required(),
    status: Joi.string().max(50).required(),
});

// New schema for updating a payment
const updatePaymentSchema = Joi.object({
    status: Joi.string().max(50).optional(),
    razorpay_signature: Joi.string().max(255).optional().allow(null, ''),
    // Add any other fields you might want to update
}).min(1); // Requires at least one field to be present for an update

module.exports = {
    validateCreatePayment: validate(createPaymentSchema),
    validateUpdatePayment: validate(updatePaymentSchema), // Export the new validator
};
