const Joi = require('joi');

/**
 * Joi schema for validating the creation of a user action log.
 * This ensures that the incoming data from the request body is in the correct format
 * before it's processed by the controller and sent to the database.
 */
const userActionLogSchema = Joi.object({
  // user_id is required and must be a valid UUID.
  user_id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.base': 'User ID must be a string.',
    'string.guid': 'User ID must be a valid UUIDv4.',
    'any.required': 'User ID is a required field.',
  }),

  // action_type is required and must be a string between 3 and 100 characters.
  action_type: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Action type must be a string.',
    'string.min': 'Action type must have at least 3 characters.',
    'string.max': 'Action type cannot exceed 100 characters.',
    'any.required': 'Action type is a required field.',
  }),

  // source_feature is optional, but if provided, must be a string between 3 and 50 characters.
  source_feature: Joi.string().min(3).max(50).optional().allow(null, '').messages({
    'string.base': 'Source feature must be a string.',
    'string.min': 'Source feature must have at least 3 characters.',
    'string.max': 'Source feature cannot exceed 50 characters.',
  }),

  // target_entity_type is optional, but if provided, must be a string between 3 and 50 characters.
  target_entity_type: Joi.string().min(3).max(50).optional().allow(null, '').messages({
    'string.base': 'Target entity type must be a string.',
    'string.min': 'Target entity type must have at least 3 characters.',
    'string.max': 'Target entity type cannot exceed 50 characters.',
  }),

  // target_entity_id is optional, but if provided, must be a string (can be UUID or other ID format).
  target_entity_id: Joi.string().max(36).optional().allow(null, '').messages({
      'string.base': 'Target entity ID must be a string.',
      'string.max': 'Target entity ID cannot exceed 36 characters.',
  }),

  // status is required and must be either 'SUCCESS' or 'FAILURE'.
  status: Joi.string().valid('SUCCESS', 'FAILURE').required().messages({
    'string.base': 'Status must be a string.',
    'any.only': 'Status must be either "SUCCESS" or "FAILURE".',
    'any.required': 'Status is a required field.',
  }),

  // metadata is optional and must be a valid JSON object.
  metadata: Joi.object().optional().allow(null).messages({
    'object.base': 'Metadata must be an object.',
  }),
});

/**
 * Middleware function to validate the request body against the userActionLogSchema.
 * If validation fails, it sends a 400 Bad Request response with the error details.
 * If validation succeeds, it calls the next middleware in the stack.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const validateUserActionLog = (req, res, next) => {
  const { error } = userActionLogSchema.validate(req.body, {
    abortEarly: false, // Report all errors, not just the first one
    stripUnknown: true, // Remove unknown keys from the validated object
  });

  if (error) {
    // Map the Joi error details to a more readable format
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    console.error('Validation Error:', errorMessages);
    return res.status(400).json({
      message: 'Invalid request data.',
      errors: errorMessages,
    });
  }

  next();
};

module.exports = {
  validateUserActionLog,
};
