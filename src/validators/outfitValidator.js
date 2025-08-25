// /validators/outfit.validator.js
const Joi = require('joi');

// Joi schema for a single dress component within an outfit
const dressComponentSchema = Joi.object({
    dress_id: Joi.string().hex().length(24).required().messages({
        'string.base': 'dress_id must be a string.',
        'string.hex': 'dress_id must be a valid MongoDB ObjectId.',
        'string.length': 'dress_id must be 24 characters long.',
        'any.required': 'dress_id is required.',
    }),
    dress_category_id: Joi.number().required().messages({
        'number.base': 'dress_category_id must be a number.',
        'any.required': 'dress_category_id is required.',
    }),
    dress_subcategory_id: Joi.number().required().messages({
        'number.base': 'dress_subcategory_id must be a number.',
        'any.required': 'dress_subcategory_id is required.',
    }),
});

// Schema for the overall_color_palette object
const colorPaletteSchema = Joi.object({
    name: Joi.string().required(),
    hex: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).required(),
    coverage: Joi.number().min(0).max(1).required(),
});

// Schema for creating a new outfit
const addOutfitSchema = Joi.object({
    user_id: Joi.string().uuid().required(),
    wardrobe_id: Joi.string().uuid().optional().allow(null),
    name: Joi.string().trim().min(1).max(255).required(),
    description: Joi.string().allow('').optional(),
    outfit_image_url: Joi.string().uri().optional().allow(null),
    dress_components: Joi.array().items(dressComponentSchema).min(1).required(),
    styling_aesthetics: Joi.array().items(Joi.string()).optional().default([]),
    composed_by: Joi.string().valid('user', 'ai_suggestion').required(),
    overall_color_palette: Joi.array().items(colorPaletteSchema).optional().default([]),
    generated_tags: Joi.array().items(Joi.string()).optional().default([]),
    is_favorite: Joi.boolean().optional().default(false),
    user_preferences: Joi.number().valid(0, 1).optional(),
    tags: Joi.array().items(Joi.string()).optional().default([]),
});

// Schema for updating an existing outfit. All fields are optional.
const updateOutfitSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).optional(),
    description: Joi.string().allow('').optional(),
    wardrobe_id: Joi.string().uuid().optional().allow(null), // Allows moving the outfit
    outfit_image_url: Joi.string().uri().optional().allow(null),
    dress_components: Joi.array().items(dressComponentSchema).min(1).optional(),
    styling_aesthetics: Joi.array().items(Joi.string()).optional(),
    overall_color_palette: Joi.array().items(colorPaletteSchema).optional(),
    generated_tags: Joi.array().items(Joi.string()).optional(),
    is_favorite: Joi.boolean().optional(),
    user_preferences: Joi.number().valid(0, 1).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
}).min(1).messages({ // Ensure at least one field is being updated
    'object.min': 'Update operation requires at least one field to be modified.',
});

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
    validateAddOutfit: validate(addOutfitSchema),
    validateUpdateOutfit: validate(updateOutfitSchema),
};