const Joi = require('joi');

// This schema validates the payload for adding a new dress.
const addDressSchema = Joi.object({
    // The wardrobe_id is an optional, contextual field for routing the dress, not part of the schema itself.
    wardrobe_id: Joi.string().optional(),

    // --- Core Identifiers & Attributes ---
    user_id: Joi.string().required(),
    name: Joi.string().max(255).trim().required(),
    description: Joi.string().allow('', null),

    // --- Taxonomy & Core Category (Linked to PostgreSQL) ---
    category_id: Joi.number().integer().required(),
    category_name: Joi.string().required(),
    sub_category_id: Joi.number().integer().required(),
    sub_category_name: Joi.string().required(),

    // --- Physical Attributes ---
    color_family: Joi.string().required(), // Added to match Mongoose schema
    color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
        coverage: Joi.number()
    })).optional(),
    dominant_color_hex: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).allow(null),
    print_pattern: Joi.string().allow(null),
    silhouette: Joi.string().allow(null),
    garment_length: Joi.string().allow(null),
    fit_type: Joi.string().allow(null),

    // --- Structural Components (Nested Object) ---
    components: Joi.object({
        neckline: Joi.string().allow(null),
        sleeves: Joi.string().allow(null),
        waistline: Joi.string().allow(null),
        hemline: Joi.string().allow(null),
        closure: Joi.string().allow(null),
        collar_lapel_type: Joi.string().allow(null)
    }).optional(),

    // --- Fabric Details (Nested Object) ---
    fabric: Joi.object({
        material: Joi.array().items(Joi.string()).optional(),
        weight_drape: Joi.string().allow(null),
        texture: Joi.string().allow(null)
    }).optional(),

    // --- Embellishments & Details ---
    details: Joi.array().items(Joi.string()).optional(),

    // --- Functional & Aesthetic Classification ---
    function_occasion: Joi.array().items(Joi.string()).optional(),
    style_tags: Joi.array().items(Joi.string()).optional(),
    is_favorite: Joi.boolean().optional(),
    
    // --- Media Assets ---
    media_assets: Joi.object({
        image_urls: Joi.array().items(Joi.string().uri()).optional()
    }).optional()
});

// This schema validates the payload for updating a dress. All fields are optional.
const updateDressSchema = Joi.object({
    name: Joi.string().max(255).trim().optional(),
    description: Joi.string().allow('', null),
    category_id: Joi.number().integer().optional(),
    category_name: Joi.string().optional(),
    sub_category_id: Joi.number().integer().optional(),
    sub_category_name: Joi.string().optional(),
    color_family: Joi.string().optional(), // Added to match Mongoose schema
    color_palette: Joi.array().items(Joi.object({
        name: Joi.string(),
        hex: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
        coverage: Joi.number()
    })).optional(),
    dominant_color_hex: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).allow(null),
    print_pattern: Joi.string().allow(null),
    silhouette: Joi.string().allow(null),
    garment_length: Joi.string().allow(null),
    fit_type: Joi.string().allow(null),
    components: Joi.object({
        neckline: Joi.string().allow(null),
        sleeves: Joi.string().allow(null),
        waistline: Joi.string().allow(null),
        hemline: Joi.string().allow(null),
        closure: Joi.string().allow(null),
        collar_lapel_type: Joi.string().allow(null)
    }).optional(),
    fabric: Joi.object({
        material: Joi.array().items(Joi.string()).optional(),
        weight_drape: Joi.string().allow(null),
        texture: Joi.string().allow(null)
    }).optional(),
    details: Joi.array().items(Joi.string()).optional(),
    function_occasion: Joi.array().items(Joi.string()).optional(),
    style_tags: Joi.array().items(Joi.string()).optional(),
    is_favorite: Joi.boolean().optional(),
    media_assets: Joi.object({
        image_urls: Joi.array().items(Joi.string().uri()).optional()
    }).optional()
}).min(1); // Ensure at least one field is provided for an update.

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