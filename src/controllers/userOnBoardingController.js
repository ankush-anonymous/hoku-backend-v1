// controllers/userOnboardingController.js

const userOnboardingService = require('../services/userOnboardingService');

/**
 * @description Handles the request for basic user signup.
 */
const signup = async (req, res) => {
  try {
    const { email_id, password } = req.body;
    const ipAddress = req.ip;

    const result = await userOnboardingService.userSignup({ email_id, password, ipAddress });

    res.status(201).json(result);
  } catch (error) {
    console.error('Controller Error: Basic signup failed.', error.message);
    // Handle specific error for existing user
    if (error.code === '23505') {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to sign up user.', error: error.message });
  }
};

/**
 * @description Handles the request for a complete user onboarding.
 */
const completeOnboarding = async (req, res) => {
    try {
        const { userDetails, userPreferences, dresses } = req.body;
        const ipAddress = req.ip;

        const result = await userOnboardingService.completeOnboarding({
            userDetails,
            userPreferences,
            dresses,
            ipAddress
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Controller Error: Complete onboarding failed.', error.message);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        res.status(500).json({ message: 'Failed to complete onboarding.', error: error.message });
    }
};


/**
 * @description Handles the request to update user and wardrobe details.
 */
const updateDetails = async (req, res) => {
    try {
        const { userId, wardrobeId, userDetails, userPreferences, wardrobeDetails, dresses } = req.body;
        const ipAddress = req.ip;

        const result = await userOnboardingService.updateOnboardingDetails({
            userId,
            wardrobeId,
            userDetails,
            userPreferences,
            wardrobeDetails,
            dresses,
            ipAddress
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Controller Error: Failed to update onboarding details.', error.message);
        res.status(500).json({ message: 'Failed to update details.', error: error.message });
    }
};

module.exports = {
  signup,
  completeOnboarding,
  updateDetails,
};
