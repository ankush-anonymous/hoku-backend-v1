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

const createSubscriptionSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    plan_id: Joi.string().uuid().required(),
    razorpay_subscription_id: Joi.string().max(255).required(),
    status: Joi.string().max(50).required(),
    current_period_start: Joi.date().iso().optional().allow(null),
    current_period_end: Joi.date().iso().optional().allow(null),
    trial_ends_at: Joi.date().iso().optional().allow(null),
});

const updateSubscriptionSchema = Joi.object({
    status: Joi.string().max(50).optional(),
    current_period_start: Joi.date().iso().optional().allow(null),
    current_period_end: Joi.date().iso().optional().allow(null),
    trial_ends_at: Joi.date().iso().optional().allow(null),
    cancelled_at: Joi.date().iso().optional().allow(null),
    ended_at: Joi.date().iso().optional().allow(null),
}).min(1);

module.exports = {
    validateCreateSubscription: validate(createSubscriptionSchema),
    validateUpdateSubscription: validate(updateSubscriptionSchema),
};
