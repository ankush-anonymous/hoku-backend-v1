// /validators/outfit.validator.js
const Joi = require('joi');

// Joi schema for a single dress component within an outfit
const dressComponentSchema = Joi.object({
    dress_id: Joi.string().hex().length(24).required().messages({
        'string.hex': 'dress_id must be a valid MongoDB ObjectId',
        'string.length': 'dress_id must be 24 characters long'
    }),
    dress_type_id: Joi.string().required()
});

// Schema for creating a new outfit
const addOutfitSchema = Joi.object({
    // --- Contextual Linking Fields (for the controller) ---
    wardrobe_id: Joi.string().uuid().optional(),
    in_wardrobe: Joi.boolean().optional(),

    // --- Core Outfit Fields (for the database) ---
    user_id: Joi.string().uuid().required(),
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
    outfit_image_url: Joi.string().uri().allow(null),
    dress_components: Joi.array().items(dressComponentSchema).min(1).required(),
    styling_aesthetics: Joi.array().items(Joi.string()).optional(),
    composed_by: Joi.string().valid('user', 'ai_suggestion').required(),
    source_log_id: Joi.string().uuid().allow(null),
    overall_color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string(),
        coverage: Joi.number()
    })).optional(),
    ai_features: Joi.object({
        embedding: Joi.array().items(Joi.number()).optional(),
        generated_tags: Joi.array().items(Joi.string()).optional()
    }).optional(),
    is_favorite: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    user_preferences: Joi.number().valid(0, 1).optional()
}).oxor('wardrobe_id', 'in_wardrobe'); // Ensures that only one of these keys can be present

// Schema for updating an existing outfit. All fields are optional.
const updateOutfitSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().allow('', null),
    outfit_image_url: Joi.string().uri().allow(null),
    dress_components: Joi.array().items(dressComponentSchema).min(1).optional(),
    styling_aesthetics: Joi.array().items(Joi.string()).optional(),
    overall_color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string(),
        coverage: Joi.number()
    })).optional(),
    is_favorite: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    user_preferences: Joi.number().valid(0, 1).optional()
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
    validateAddOutfit: validate(addOutfitSchema),
    validateUpdateOutfit: validate(updateOutfitSchema),
};
