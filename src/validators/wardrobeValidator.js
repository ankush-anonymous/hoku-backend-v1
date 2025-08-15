// wardrobe.validator.js
const Joi = require('joi');

const createWardrobeSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    name: Joi.string().max(255).required(),
    intent: Joi.string().optional().allow(null, ''),
    lifestyle: Joi.string().max(100).optional().allow(null, ''),
    negative_pref: Joi.string().optional().allow(null, ''),
});

const updateWardrobeSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    intent: Joi.string().optional().allow(null, ''),
    lifestyle: Joi.string().max(100).optional().allow(null, ''),
    negative_pref: Joi.string().optional().allow(null, ''),
}).min(1); // Requires at least one field to be updated

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Validator Error:', error.details.map(d => d.message).join(', '));
        return res.status(400).json({
            message: 'Validation failed',
            details: error.details.map(d => d.message),
        });
    }
    next();
};

module.exports = {
    validateCreateWardrobe: validate(createWardrobeSchema),
    validateUpdateWardrobe: validate(updateWardrobeSchema),
};
