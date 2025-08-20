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

const createCreditTransactionSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    transaction_type: Joi.string().valid('purchase', 'spend', 'adjustment', 'refund').required(),
    amount: Joi.number().integer().required(),
    related_payment_id: Joi.string().uuid().optional().allow(null),
    related_feature_code: Joi.string().max(50).optional().allow(null),
    description: Joi.string().optional().allow(null, ''),
});

module.exports = {
    validateCreateCreditTransaction: validate(createCreditTransactionSchema),
};
