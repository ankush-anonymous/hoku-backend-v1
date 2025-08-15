// dress.validator.js
const Joi = require('joi');

// This schema validates the payload for adding a new dress.
// It includes all the fields from your Mongoose schema and the optional wardrobe_id.
const addDressSchema = Joi.object({
    // The wardrobe_id is optional. If not provided, the dress goes to the default wardrobe.
    wardrobe_id: Joi.string().uuid().optional(),

    // --- Core Dress Fields ---
    user_id: Joi.string().uuid().required(),
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('', null),
    brand: Joi.string().allow(null),
    size: Joi.string().allow(null),
    
    // --- Taxonomy IDs ---
    dress_type_id: Joi.number().integer().required(),
    category_id: Joi.number().integer().required(),

    // --- AI & Analytical Fields ---
    style_tags: Joi.array().items(Joi.string()).optional(),
    material: Joi.array().items(Joi.string()).optional(),
    pattern: Joi.string().allow(null),
    color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string(),
        coverage: Joi.number()
    })).optional(),
    dominant_color_hex: Joi.string().allow(null),
    ai_features: Joi.object().optional(),

    // --- Context Fields ---
    season_suitability: Joi.array().items(Joi.string()).optional(),
    occasion_suitability: Joi.array().items(Joi.string()).optional(),
    
    // --- User Context ---
    user_context: Joi.object({
        personal_rating: Joi.number().min(1).max(5),
        notes: Joi.string().allow('', null)
    }).optional(),
    is_favorite: Joi.boolean().optional(),

    // --- Media Assets ---
    media_assets: Joi.object({
        image_urls: Joi.array().items(Joi.string().uri()),
        video_url: Joi.string().uri().allow(null)
    }).optional()
});

// This schema validates the payload for updating a dress. All fields are optional.
const updateDressSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().allow('', null),
    brand: Joi.string().allow(null),
    size: Joi.string().allow(null),
    dress_type_id: Joi.number().integer().optional(),
    category_id: Joi.number().integer().optional(),
    style_tags: Joi.array().items(Joi.string()).optional(),
    material: Joi.array().items(Joi.string()).optional(),
    pattern: Joi.string().allow(null),
    color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string(),
        coverage: Joi.number()
    })).optional(),
    dominant_color_hex: Joi.string().allow(null),
    ai_features: Joi.object().optional(),
    season_suitability: Joi.array().items(Joi.string()).optional(),
    occasion_suitability: Joi.array().items(Joi.string()).optional(),
    user_context: Joi.object({
        personal_rating: Joi.number().min(1).max(5),
        notes: Joi.string().allow('', null)
    }).optional(),
    is_favorite: Joi.boolean().optional(),
    media_assets: Joi.object({
        image_urls: Joi.array().items(Joi.string().uri()),
        video_url: Joi.string().uri().allow(null)
    }).optional()
}).min(1); // Ensure at least one field is being updated

// Generic validation middleware
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
    validateAddDress: validate(addDressSchema),
    validateUpdateDress: validate(updateDressSchema),
};
