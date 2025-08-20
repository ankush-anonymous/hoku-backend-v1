// user.validator.js
const Joi = require('joi');

// Schema for creating a new user.
const createUserSchema = Joi.object({
    name: Joi.string().max(255).required(),
    phone_number: Joi.string().max(20).optional().allow(null, ''),
    email_id: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(255).required(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    date_of_birth: Joi.date().iso().optional(),
    colour_tone: Joi.string().max(255).optional(),
    undertone: Joi.string().max(255).optional(),
    body_type: Joi.string().max(50).optional(),
});

// Schema for user signup (email and password only).
const signupSchema = Joi.object({
    email_id: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(255).required(),
});

// Schema for updating an existing user.
const updateUserSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    phone_number: Joi.string().max(20).optional().allow(null, ''),
    is_phone_verified: Joi.boolean().optional(),
    is_email_verified: Joi.boolean().optional(),
    current_location_id: Joi.string().uuid().optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    date_of_birth: Joi.date().iso().optional(),
    colour_tone: Joi.string().max(255).optional(),
    undertone: Joi.string().max(255).optional(),
    body_type: Joi.string().max(50).optional(),
}).min(1); // At least one field must be provided for an update.

// Schema for user login.
const loginSchema = Joi.object({
    email_id: Joi.string().email().required(),
    password: Joi.string().required(),
});


// Middleware function to validate request body against a schema
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

module.exports = {
    validateCreateUser: validate(createUserSchema),
    validateUpdateUser: validate(updateUserSchema),
    validateLogin: validate(loginSchema), // Added the export for login validation
    validateSignup: validate(signupSchema),
};
