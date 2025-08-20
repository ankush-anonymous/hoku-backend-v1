// wardrobe.controller.js
const wardrobeRepository = require('../repositories/wardrobeRepository');
const UserActionsLogController = require('./userActivityController');
const { pool } = require("../infrastructure/PgDB/connect"); // Required for transactions

const createWardrobe = async (req, res) => {
    const userId = req.body.user_id;
    const { name } = req.body;

    try {
        // Prevent users from creating another wardrobe with the reserved name
        if (name === 'Your Dresses') {
            const existingWardrobes = await wardrobeRepository.getWardrobesByUserId(userId);
            const defaultExists = existingWardrobes.some(w => w.name === 'Your Dresses');
            if (defaultExists) {
                return res.status(409).json({ message: 'A default wardrobe named "Your Dresses" already exists and another cannot be created.' });
            }
        }

        // The repository now handles all new fields from the body
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

        // The default wardrobe should always exist after user creation.
        // If it's missing, it signifies a potential data integrity problem.
        const hasDefaultWardrobe = wardrobes.some(w => w.name === 'Your Dresses');
        if (!hasDefaultWardrobe) {
            // This is a server-side issue, so we throw an error.
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

        // --- NEW LOGIC: Protect the default wardrobe ---
        const originalWardrobe = await wardrobeRepository.getWardrobeById(id);
        if (!originalWardrobe) {
            return res.status(404).json({ message: 'Wardrobe not found' });
        }
        if (originalWardrobe.name === 'Your Dresses' && updates.name && updates.name !== 'Your Dresses') {
            return res.status(403).json({ message: 'The default "Your Dresses" wardrobe cannot be renamed.' });
        }

        const updatedWardrobe = await wardrobeRepository.updateWardrobeById(id, updates);
        if (!updatedWardrobe) {
            // This case might be redundant now but is good for safety.
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

        // --- NEW LOGIC: Protect the default wardrobe ---
        const wardrobeToDelete = await wardrobeRepository.getWardrobeById(id);
        if (!wardrobeToDelete) {
            return res.status(404).json({ message: 'Wardrobe not found' });
        }
        if (wardrobeToDelete.name === 'Your Dresses') {
            return res.status(403).json({ message: 'The default "Your Dresses" wardrobe cannot be deleted.' });
        }

        const deletedWardrobe = await wardrobeRepository.deleteWardrobeById(id);
        
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

/**
 * @description Updates the order of wardrobes for a user.
 * @param {object} req - Express request object, body should contain { userId, orderedIds: [...] }
 * @param {object} res - Express response object
 */
const updateWardrobeOrder = async (req, res) => {
    const { userId, orderedIds } = req.body;

    if (!userId || !Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "userId and an array of orderedIds are required." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create an array of Promises for all the update operations
        const updatePromises = orderedIds.map((wardrobeId, index) => {
            const query = `
                UPDATE wardrobes 
                SET position_in_wardrobe = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 AND user_id = $3;
            `;
            return client.query(query, [index, wardrobeId, userId]);
        });

        // Execute all promises
        await Promise.all(updatePromises);

        await client.query('COMMIT');

        await UserActionsLogController.logAction({
            user_id: userId,
            action_type: 'REORDER_WARDROBES',
            source_feature: 'WardrobeManagement',
            target_entity_type: 'USER_WARDROBES',
            target_entity_id: userId,
            status: 'SUCCESS',
            metadata: { order: orderedIds, ip: req.ip }
        });

        res.status(200).json({ message: 'Wardrobe order updated successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Controller Error: Could not update wardrobe order.', error.message);
        res.status(500).json({ message: 'Failed to update wardrobe order.', error: error.message });
    } finally {
        client.release();
    }
};


module.exports = {
    createWardrobe,
    getAllWardrobes,
    getWardrobeById,
    getWardrobesByUserId,
    updateWardrobeById,
    deleteWardrobeById,
    updateWardrobeOrder, // Export the new function
};
