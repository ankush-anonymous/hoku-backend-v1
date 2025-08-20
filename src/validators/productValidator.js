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

const createProductSchema = Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().optional().allow(null, ''),
});

const updateProductSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().optional().allow(null, ''),
    is_active: Joi.boolean().optional(),
}).min(1);

module.exports = {
    validateCreateProduct: validate(createProductSchema),
    validateUpdateProduct: validate(updateProductSchema),
};