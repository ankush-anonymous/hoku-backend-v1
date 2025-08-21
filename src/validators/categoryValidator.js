// /validators/category.validator.js
const Joi = require('joi');

// Schema for creating a new main dress category
const createCategorySchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().allow('', null)
});

// Schema for updating a main dress category
const updateCategorySchema = Joi.object({
    name: Joi.string().max(100).optional(),
    description: Joi.string().allow('', null).optional()
}).min(1); // At least one field must be provided

// Schema for creating a new dress sub-category
const createSubCategorySchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().allow('', null)
});

// Schema for updating a dress sub-category
const updateSubCategorySchema = Joi.object({
    name: Joi.string().max(100).optional(),
    description: Joi.string().allow('', null).optional()
}).min(1);

// Generic validation middleware
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        console.error('[Validator Error]', error.details.map(d => d.message).join(', '));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            details: error.details.map(d => d.message),
        });
    }
    next();
};

module.exports = {
    validateCreateCategory: validate(createCategorySchema),
    validateUpdateCategory: validate(updateCategorySchema),
    validateCreateSubCategory: validate(createSubCategorySchema),
    validateUpdateSubCategory: validate(updateSubCategorySchema),
};
