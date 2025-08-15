// wardrobe.controller.js
const wardrobeRepository = require('../repositories/wardrobeRepository');
// Import the refactored controller
const UserActionsLogController = require('./userActivityController');

const createWardrobe = async (req, res) => {
    const userId = req.body.user_id; 
    const { name } = req.body;

    try {
        // Check if the user is trying to create a reserved-name wardrobe
        if (name === 'Your Dresses') {
            const existingWardrobes = await wardrobeRepository.getWardrobesByUserId(userId);
            const defaultExists = existingWardrobes.some(w => w.name === 'Your Dresses');
            if (defaultExists) {
                return res.status(409).json({ message: 'A default wardrobe named "Your Dresses" already exists for this user.' });
            }
        }

        const wardrobeData = req.body;
        const newWardrobe = await wardrobeRepository.createWardrobe(wardrobeData);

        await UserActionsLogController.logAction({
            user_id: userId,
            action_type: 'CREATE_WARDROBE',
            source_feature: 'WardrobeManagement',
            target_entity_type: 'WARDROBE',
            target_entity_id: newWardrobe.id,
            status: 'SUCCESS',
            metadata: { name: newWardrobe.name, ip: req.ip }
        });

        res.status(201).json(newWardrobe);
    } catch (error) {
        console.error('Controller Error: Could not create wardrobe.', error.message);
        
        if (userId) {
            await UserActionsLogController.logAction({
                user_id: userId,
                action_type: 'CREATE_WARDROBE_FAILURE',
                source_feature: 'WardrobeManagement',
                target_entity_type: 'WARDROBE',
                status: 'FAILURE',
                metadata: { error: error.message, ip: req.ip, requestBody: req.body }
            }).catch(logError => console.error("CRITICAL: Failed to log the failure event:", logError));
        }
        
        res.status(500).json({ message: 'Failed to create wardrobe.', error: error.message });
    }
};

const getAllWardrobes = async (req, res) => {
    try {
        const wardrobes = await wardrobeRepository.getAllWardrobes();
        res.status(200).json(wardrobes);
    } catch (error) {
        console.error('Controller Error: Could not get all wardrobes.', error.message);
        res.status(500).json({ message: 'Failed to retrieve wardrobes.', error: error.message });
    }
};

const getWardrobeById = async (req, res) => {
    try {
        const { id } = req.params;
        const wardrobe = await wardrobeRepository.getWardrobeById(id);
        if (!wardrobe) {
            return res.status(404).json({ message: 'Wardrobe not found' });
        }
        res.status(200).json(wardrobe);
    } catch (error) {
        console.error('Controller Error: Could not get wardrobe by ID.', error.message);
        res.status(500).json({ message: 'Failed to retrieve wardrobe.', error: error.message });
    }
};

const getWardrobesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const wardrobes = await wardrobeRepository.getWardrobesByUserId(userId);

        // --- NEW LOGIC: Check for the default wardrobe ---
        const hasDefaultWardrobe = wardrobes.some(w => w.name === 'Your Dresses');
        if (!hasDefaultWardrobe) {
            // This indicates a critical data integrity issue.
            throw new Error(`Data integrity error: Default 'Your Dresses' wardrobe is missing for user ${userId}.`);
        }

        res.status(200).json(wardrobes);
    } catch (error) {
        console.error('Controller Error: Could not get wardrobes by user ID.', error.message);
        res.status(500).json({ message: 'Failed to retrieve user wardrobes.', error: error.message });
    }
};

const updateWardrobeById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedWardrobe = await wardrobeRepository.updateWardrobeById(id, updates);
        if (!updatedWardrobe) {
            return res.status(404).json({ message: 'Wardrobe not found or nothing to update' });
        }

        await UserActionsLogController.logAction({
            user_id: updatedWardrobe.user_id,
            action_type: 'UPDATE_WARDROBE',
            source_feature: 'WardrobeManagement',
            target_entity_type: 'WARDROBE',
            target_entity_id: id,
            status: 'SUCCESS',
            metadata: { updatedFields: Object.keys(updates), ip: req.ip }
        });

        res.status(200).json(updatedWardrobe);
    } catch (error) {
        console.error('Controller Error: Could not update wardrobe.', error.message);
        res.status(500).json({ message: 'Failed to update wardrobe.', error: error.message });
    }
};

const deleteWardrobeById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedWardrobe = await wardrobeRepository.deleteWardrobeById(id);
        if (!deletedWardrobe) {
            return res.status(404).json({ message: 'Wardrobe not found' });
        }

        await UserActionsLogController.logAction({
            user_id: deletedWardrobe.user_id,
            action_type: 'DELETE_WARDROBE',
            source_feature: 'WardrobeManagement',
            target_entity_type: 'WARDROBE',
            target_entity_id: id,
            status: 'SUCCESS',
            metadata: { name: deletedWardrobe.name, ip: req.ip }
        });

        res.status(200).json({ message: 'Wardrobe deleted successfully', wardrobe: deletedWardrobe });
    } catch (error) {
        console.error('Controller Error: Could not delete wardrobe.', error.message);
        res.status(500).json({ message: 'Failed to delete wardrobe.', error: error.message });
    }
};

module.exports = {
    createWardrobe,
    getAllWardrobes,
    getWardrobeById,
    getWardrobesByUserId,
    updateWardrobeById,
    deleteWardrobeById,
};
