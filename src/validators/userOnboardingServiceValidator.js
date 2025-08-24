// validators/userOnboardingValidator.js

const Joi = require('joi');

// --- Reusable Schemas for consistency ---
const userDetailsSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    phone_number: Joi.string().max(20).optional().allow(null, ''),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    date_of_birth: Joi.date().iso().optional(),
    skin_type: Joi.string().max(255).optional(),
    undertone: Joi.string().max(255).optional(),
    body_type: Joi.string().max(50).optional(),
    height_range: Joi.string().max(50).optional(),
    weight_range: Joi.string().max(50).optional(),
    top_size: Joi.string().max(50).optional(),
    bottom_size: Joi.string().max(50).optional(),
});

const userPreferencesSchema = Joi.object({
    intent: Joi.string().optional().allow(null, ''),
    lifestyle: Joi.string().optional().allow(null, ''),
    negative_pref: Joi.string().optional().allow(null, ''),
});

const dressSchema = Joi.object({
    name: Joi.string().required(),
    category_id: Joi.number().required(),
    category_name: Joi.string().required(),
    sub_category_id: Joi.number().required(),
    sub_category_name: Joi.string().required(),
    // Allow any other fields on the dress object
}).unknown(true);


// --- Specific Schemas for each route ---

const signupSchema = Joi.object({
  email_id: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const completeOnboardingSchema = Joi.object({
    userDetails: userDetailsSchema.keys({
        email_id: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().max(255).required(), // Name is required for full onboarding
    }).required(),
    userPreferences: userPreferencesSchema.optional(),
    dresses: Joi.array().items(dressSchema).optional(),
});

const updateDetailsSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    wardrobeId: Joi.string().uuid().required(),
    userDetails: userDetailsSchema.optional(),
    userPreferences: userPreferencesSchema.optional(),
    wardrobeDetails: Joi.object({
        name: Joi.string().max(255).optional(),
        intent: Joi.string().optional().allow(null, ''),
        lifestyle: Joi.string().max(100).optional().allow(null, ''),
        negative_pref: Joi.string().optional().allow(null, ''),
        is_favorite: Joi.boolean().optional(),
        is_public: Joi.boolean().optional()
    }).optional(),
    dresses: Joi.array().items(dressSchema).optional(),
}).min(3); // Require at least one of the optional fields besides userId and wardrobeId


/**
 * @description Middleware to validate the request body.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = {
  validateSignup: validate(signupSchema),
  validateCompleteOnboarding: validate(completeOnboardingSchema),
  validateUpdateDetails: validate(updateDetailsSchema),
};
