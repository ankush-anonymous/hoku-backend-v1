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

const createPlanSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    razorpay_plan_id: Joi.string().max(255).optional().allow(null, ''),
    name: Joi.string().max(255).required(),
    type: Joi.string().valid('subscription', 'one_time').required(),
    price: Joi.number().precision(2).required(),
    currency: Joi.string().max(10).required(),
    billing_interval: Joi.string().max(20).optional().allow(null),
    interval_count: Joi.number().integer().optional().allow(null),
    credits_granted: Joi.number().integer().optional().allow(null),
});

const updatePlanSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    price: Joi.number().precision(2).optional(),
    credits_granted: Joi.number().integer().optional().allow(null),
    is_active: Joi.boolean().optional(),
}).min(1);

module.exports = {
    validateCreatePlan: validate(createPlanSchema),
    validateUpdatePlan: validate(updatePlanSchema),
};