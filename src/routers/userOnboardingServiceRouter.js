// routers/userOnboardingRouter.js

const express = require('express');
const router = express.Router();
// Correctly import the controller, not the service
const userOnboardingController = require('../controllers/userOnBoardingController'); 
const userOnboardingValidator = require('../validators/userOnboardingServiceValidator');

/**
 * @route   POST /api/onboarding/signup
 * @desc    Register a new user and create their default wardrobe.
 * @access  Public
 */
router.post(
  '/signup',
  userOnboardingValidator.validateSignup,
  userOnboardingController.signup // Call the controller function
);

/**
 * @route   POST /api/onboarding/complete
 * @desc    Onboard a new user with full details and initial dresses.
 * @access  Public
 */
router.post(
  '/complete',
  userOnboardingValidator.validateCompleteOnboarding,
  userOnboardingController.completeOnboarding // Call the controller function
);

/**
 * @route   PATCH /api/onboarding/update-details
 * @desc    Update an existing user's profile, wardrobe, and add dresses.
 * @access  Protected (User should be authenticated)
 */
router.patch(
    '/update-details',
    userOnboardingValidator.validateUpdateDetails,
    userOnboardingController.updateDetails // Call the controller function
);


module.exports = router;
