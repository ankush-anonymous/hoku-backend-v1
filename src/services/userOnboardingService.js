// services/userSignupService.js

const bcrypt = require("bcryptjs");
const userRepository = require('../repositories/userRepository');
const wardrobeRepository = require('../repositories/wardrobeRepository');
const dressRepository = require('../repositories/dressRepository');
const wardrobeDressesRepository = require('../repositories/wardrobe_dressRepository');
const UserActionsLogController = require('../controllers/userActivityController');

/**
 * @description Internal helper function to create a dress and link it to the default wardrobe and an optional specific wardrobe.
 * This centralizes the dress creation logic.
 */
const _addDressAndLinkToWardrobes = async ({ userId, specificWardrobeId, dressData, ipAddress, sourceFeature }) => {
    const defaultWardrobe = await wardrobeRepository.findDefaultWardrobeByUserId(userId);
    if (!defaultWardrobe) {
        throw new Error(`Default wardrobe not found for user ${userId}.`);
    }

    const fullDressData = { ...dressData, user_id: userId };
    const newDress = await dressRepository.createDress(fullDressData);
    const dressMongoId = newDress._id.toString();

    // Always link to the default wardrobe
    await wardrobeDressesRepository.linkDressToWardrobe(defaultWardrobe.id, dressMongoId);

    // If a different wardrobe was specified, link it there as well
    if (specificWardrobeId && specificWardrobeId !== defaultWardrobe.id) {
        await wardrobeDressesRepository.linkDressToWardrobe(specificWardrobeId, dressMongoId);
    }

    await UserActionsLogController.logAction({
        user_id: userId,
        action_type: 'ADD_DRESS',
        source_feature: sourceFeature, // e.g., 'OnboardingService' or 'OnboardingUpdateService'
        target_entity_type: 'DRESS',
        target_entity_id: dressMongoId,
        status: 'SUCCESS',
        metadata: { dress_name: newDress.name, linked_to_wardrobe: specificWardrobeId || defaultWardrobe.id, ip: ipAddress },
    });

    return newDress;
};




/**
 * @description Handles basic user signup with just email and password.
 * Creates a user and their default wardrobe.
 */
const userSignup = async ({ email_id, name, ipAddress }) => {
  let newUser;
  let dressesWardrobe; // Keep track of the first wardrobe in case the second fails

  try {
    // 1. Create the user
    const userData = { email_id, name };
    newUser = await userRepository.createUser(userData);

    await UserActionsLogController.logAction({
      user_id: newUser.id, action_type: 'SIGNUP_USER', source_feature: 'AuthenticationService',
      target_entity_type: 'USER', target_entity_id: newUser.id, status: 'SUCCESS', metadata: { ip: ipAddress },
    });

    // 2. Create the "Your Dresses" wardrobe
    const dressesWardrobeData = { user_id: newUser.id, name: 'Your Dresses' };
    dressesWardrobe = await wardrobeRepository.createWardrobe(dressesWardrobeData);

    await UserActionsLogController.logAction({
      user_id: newUser.id, action_type: 'CREATE_WARDROBE', source_feature: 'AuthenticationService',
      target_entity_type: 'WARDROBE', target_entity_id: dressesWardrobe.id, status: 'SUCCESS',
      metadata: { name: dressesWardrobe.name, type: 'dresses', ip: ipAddress },
    });

    // 3. Create the "Your Outfits" wardrobe
    const outfitsWardrobeData = { user_id: newUser.id, name: 'Your Outfits' };
    const outfitsWardrobe = await wardrobeRepository.createWardrobe(outfitsWardrobeData);

    await UserActionsLogController.logAction({
      user_id: newUser.id, action_type: 'CREATE_WARDROBE', source_feature: 'AuthenticationService',
      target_entity_type: 'WARDROBE', target_entity_id: outfitsWardrobe.id, status: 'SUCCESS',
      metadata: { name: outfitsWardrobe.name, type: 'outfits', ip: ipAddress },
    });
    
    // 4. Create the "Your Favorites" wardrobe
    const favsWardrobeData = { user_id: newUser.id, name: "Your Favorites" };
    const favsWardrobe = await wardrobeRepository.createWardrobe(favsWardrobeData);

    await UserActionsLogController.logAction({
      user_id: newUser.id, action_type: 'CREATE_WARDROBE', source_feature: 'AuthenticationService',
      target_entity_type: 'WARDROBE', target_entity_id: favsWardrobe.id, status: 'SUCCESS',
      metadata: { name: favsWardrobe.name, type: 'outfits', ip: ipAddress },
    });

    // 5. Return both new IDs
    return { 
      userId: newUser.id, 
      dressesWardrobeId: dressesWardrobe.id,
      outfitsWardrobeId: outfitsWardrobe.id,
      favsWardrobeId: favsWardrobe.id 
    };

  } catch (error) {
    console.error('Service Error: User signup process failed.', error.message);
    
    // Log a failure, even if only part of the process succeeded
    if (newUser && newUser.id) {
      await UserActionsLogController.logAction({
        user_id: newUser.id, 
        action_type: 'SIGNUP_WARDROBE_FAILURE', 
        source_feature: 'AuthenticationService',
        status: 'FAILURE', 
        metadata: { 
          error: `Wardrobe creation failed: ${error.message}`,
          // Note which wardrobe was created, if any
          dressesWardrobeCreated: !!dressesWardrobe, 
          ip: ipAddress 
        },
      }).catch(logError => console.error("CRITICAL: Failed to log signup failure:", logError));
    }
    
    // Re-throw the original error to be handled by the controller
    throw error;
  }
};

/**
 * @description Handles a complete user onboarding process.
 * Creates a user, updates their full profile, creates a default wardrobe, and adds their initial dresses.
 * @param {object} onboardingData - The complete onboarding data.
 * @param {object} onboardingData.userDetails - All personal details of the user.
 * @param {object} onboardingData.userPreferences - User's style and lifestyle preferences.
 * @param {Array<object>} onboardingData.dresses - An array of dress objects to add to the wardrobe.
 * @param {string} onboardingData.ipAddress - The IP address of the user.
 * @returns {Promise<{userId: string, wardrobeId: string}>} The new user's ID and wardrobe ID.
 */
const completeOnboarding = async ({ userDetails, userPreferences, dresses = [], ipAddress }) => {
  try {
    // 1. & 2. Create the User and Default Wardrobe using the existing signup function
    const { email_id, password } = userDetails;
    const { userId, wardrobeId } = await userSignup({ email_id, password, ipAddress });

    // 3. Update User with the rest of the profile details
    const profileUpdates = { ...userDetails, ...userPreferences };
    delete profileUpdates.email_id;
    delete profileUpdates.password;

    if (Object.keys(profileUpdates).length > 0) {
        await userRepository.updateUserById(userId, profileUpdates);
        await UserActionsLogController.logAction({
            user_id: userId, action_type: 'UPDATE_USER_PROFILE', source_feature: 'OnboardingService',
            target_entity_type: 'USER', target_entity_id: userId, status: 'SUCCESS',
            metadata: { updatedFields: Object.keys(profileUpdates), ip: ipAddress },
        });
    }

    // 4. Add all provided dresses to the user's wardrobe using the helper function
    for (const dressData of dresses) {
        await _addDressAndLinkToWardrobes({
            userId,
            specificWardrobeId: wardrobeId,
            dressData,
            ipAddress,
            sourceFeature: 'OnboardingService'
        });
    }

    return { userId, wardrobeId };

  } catch (error) {
    console.error('Service Error: Complete onboarding failed.', error.message);
    // Log the failure at the appropriate step
    await UserActionsLogController.logAction({
        user_id: 'unknown',
        action_type: 'ONBOARDING_FAILURE',
        source_feature: 'OnboardingService',
        status: 'FAILURE',
        metadata: { error: error.message, step: 'user-creation-or-update', ip: ipAddress },
    }).catch(logError => console.error("CRITICAL: Failed to log onboarding failure:", logError));
    throw error;
  }
};

/**
 * @description Updates an existing user's profile, wardrobe details, and adds dresses.
 * @param {object} data - The data for updating.
 * @param {string} data.userId - The ID of the user to update.
 * @param {string} data.wardrobeId - The ID of the wardrobe to update and add dresses to.
 * @param {object} data.userDetails - The user profile details to update.
 * @param {object} data.wardrobeDetails - The wardrobe details to update.
 * @param {Array<object>} data.dresses - An array of dress objects to add.
 * @param {string} data.ipAddress - The IP address of the user.
 * @returns {Promise<{message: string}>} A success message.
 */
const updateOnboardingDetails = async ({ userId, wardrobeId, userDetails = {}, wardrobeDetails = {}, dresses = [], ipAddress }) => {
    try {
      console.log("started")
        // 1. Update User with all provided details
        if (Object.keys(userDetails).length > 0) {
            await userRepository.updateUserById(userId, userDetails);
            await UserActionsLogController.logAction({
                user_id: userId, action_type: 'UPDATE_USER_PROFILE', source_feature: 'OnboardingUpdateService',
                target_entity_type: 'USER', target_entity_id: userId, status: 'SUCCESS',
                metadata: { updatedFields: Object.keys(userDetails), ip: ipAddress },
            });
        }
              console.log("started2")


        // 2. Update Wardrobe with provided details
        if (Object.keys(wardrobeDetails).length > 0) {
            await wardrobeRepository.updateWardrobeById(wardrobeId, wardrobeDetails);
            await UserActionsLogController.logAction({
                user_id: userId, action_type: 'UPDATE_WARDROBE', source_feature: 'OnboardingUpdateService',
                target_entity_type: 'WARDROBE', target_entity_id: wardrobeId, status: 'SUCCESS',
                metadata: { updatedFields: Object.keys(wardrobeDetails), ip: ipAddress },
            });
        }

        // 3. Add all provided dresses to the user's specified wardrobe using the helper function
        for (const dressData of dresses) {
            await _addDressAndLinkToWardrobes({
                userId,
                specificWardrobeId: wardrobeId,
                dressData,
                ipAddress,
                sourceFeature: 'OnboardingUpdateService'
            });
        }
              console.log("started2")

        return { message: 'User details updated and dresses added successfully.' };

    } catch (error) {
        console.error('Service Error: Failed to update onboarding details.', error.message);
        await UserActionsLogController.logAction({
            user_id: userId,
            action_type: 'ONBOARDING_UPDATE_FAILURE',
            source_feature: 'OnboardingUpdateService',
            status: 'FAILURE',
            metadata: { error: error.message, ip: ipAddress },
        }).catch(logError => console.error("CRITICAL: Failed to log onboarding update failure:", logError));
        throw error;
    }
};


module.exports = {
  userSignup,
  completeOnboarding,
  updateOnboardingDetails,
};
