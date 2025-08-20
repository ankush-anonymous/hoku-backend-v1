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

const createFeatureSchema = Joi.object({
    feature_code: Joi.string().max(50).required(),
    name: Joi.string().max(255).required(),
    credit_cost: Joi.number().integer().default(1),
});

const updateFeatureSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    credit_cost: Joi.number().integer().optional(),
    is_active: Joi.boolean().optional(),
}).min(1);

module.exports = {
    validateCreateFeature: validate(createFeatureSchema),
    validateUpdateFeature: validate(updateFeatureSchema),
};
