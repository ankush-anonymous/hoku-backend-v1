// dress.controller.js
const dressRepository = require('../repositories/dressRepository');
const wardrobeDressesRepository = require('../repositories/wardrobe_dressRepository');
const wardrobeRepository = require('../repositories/wardrobeRepository');
const UserActionsLogController = require('./userActivityController'); // Import the logging controller

/**
 * @description Creates a dress and links it to the appropriate wardrobe(s).
 */
const addDress = async (req, res) => {
    const dressData = req.body;
    let newDress;

    try {
        // Step 1: Find the user's default wardrobe, which is essential for storing the dress.
        const defaultWardrobe = await wardrobeRepository.findDefaultWardrobeByUserId(dressData.user_id);
        if (!defaultWardrobe) {
            // This is a critical failure, as every user should have a default wardrobe.
            throw new Error(`Default 'Your Dresses' wardrobe not found for user ${dressData.user_id}.`);
        }

        // Step 2: Create the dress document in MongoDB.
        newDress = await dressRepository.createDress(dressData);
        if (!newDress) {
            throw new Error("Dress creation in MongoDB failed.");
        }

        // Step 3: Link the newly created dress to the default wardrobe in PostgreSQL.
        const dressMongoId = newDress._id.toString();
        await wardrobeDressesRepository.linkDressToWardrobe(defaultWardrobe.id, dressMongoId);
        
        // Step 4: Log the successful action.
        await UserActionsLogController.logAction({ 
            user_id: dressData.user_id,
            action_type: 'ADD_DRESS',
            source_feature: 'DressManagement',
            target_entity_type: 'DRESS',
            target_entity_id: dressMongoId,
            status: 'SUCCESS',
            metadata: { 
                dress_name: newDress.name, 
                linked_to_wardrobe: defaultWardrobe.id, // Log the default wardrobe ID
                ip: req.ip 
            }
        });

        res.status(201).json({ message: 'Dress added successfully to your default wardrobe!', dress: newDress });

    } catch (error) {
        console.error('Controller Error: Could not add dress.', error.message);
        
        // If the dress was created but a subsequent step failed, log it for debugging.
        if (newDress) {
            console.error(`CRITICAL: Dress ${newDress._id} was created but a linking or logging error occurred.`);
        }
        
        // Log the failure event.
        await UserActionsLogController.logAction({
            user_id: req.body.user_id,
            action_type: 'ADD_DRESS',
            source_feature: 'DressManagement',
            target_entity_type: 'DRESS',
            status: 'FAILURE',
            metadata: { error: error.message, ip: req.ip }
        }).catch(logError => console.error("Failed to log failure event:", logError));
        
        res.status(500).json({ message: 'Failed to add dress.', error: error.message });
    }
};

/**
 * @description Retrieves a single dress by its MongoDB ID.
 */
const getDressById = async (req, res) => {
    try {
        const { id } = req.params;
        const dress = await dressRepository.findDressById(id);
        if (!dress) {
            return res.status(404).json({ message: 'Dress not found' });
        }
        res.status(200).json(dress);
    } catch (error) {
        console.error('Controller Error: Could not get dress by ID.', error.message);
        res.status(500).json({ message: 'Failed to retrieve dress.', error: error.message });
    }
};

/**
 * @description Retrieves all dresses owned by a specific user.
 */
const getDressesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const dresses = await dressRepository.findDressesByUserId(userId);
        res.status(200).json(dresses);
    } catch (error) {
        console.error('Controller Error: Could not get dresses by user ID.', error.message);
        res.status(500).json({ message: 'Failed to retrieve user dresses.', error: error.message });
    }
};

/**
 * @description Retrieves all dresses within a specific wardrobe.
 */
const getDressesByWardrobeId = async (req, res) => {
    try {
        const { wardrobeId } = req.params;
        const dressIds = await wardrobeDressesRepository.getDressIdsByWardrobeId(wardrobeId);
        if (dressIds.length === 0) {
            return res.status(200).json([]);
        }
        const dresses = await dressRepository.findDressesByIds(dressIds);
        res.status(200).json(dresses);
    } catch (error) {
        console.error('Controller Error: Could not get dresses by wardrobe ID.', error.message);
        res.status(500).json({ message: 'Failed to retrieve wardrobe dresses.', error: error.message });
    }
};

/**
 * @description Updates a dress's information by its MongoDB ID.
 */
const updateDressById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedDress = await dressRepository.updateDress(id, updates);
        if (!updatedDress) {
            return res.status(404).json({ message: 'Dress not found or nothing to update' });
        }

        // Log the successful update
        await UserActionsLogController.logAction({
            user_id: updatedDress.user_id,
            action_type: 'UPDATE_DRESS',
            source_feature: 'DressManagement',
            target_entity_type: 'DRESS',
            target_entity_id: id,
            status: 'SUCCESS',
            metadata: { updatedFields: Object.keys(updates), ip: req.ip }
        });

        res.status(200).json(updatedDress);
    } catch (error) {
        console.error('Controller Error: Could not update dress.', error.message);
        res.status(500).json({ message: 'Failed to update dress.', error: error.message });
    }
};

/**
 * @description Deletes a dress permanently from MongoDB and all wardrobe links.
 */
const deleteDressById = async (req, res) => {
    try {
        const { id } = req.params; // MongoDB dress ID
        const deletedDress = await dressRepository.deleteDress(id);
        if (!deletedDress) {
            return res.status(404).json({ message: 'Dress not found' });
        }
        await wardrobeDressesRepository.unlinkAllInstancesOfDress(id);
        
        // Log the successful deletion
        await UserActionsLogController.logAction({
            user_id: deletedDress.user_id,
            action_type: 'DELETE_DRESS',
            source_feature: 'DressManagement',
            target_entity_type: 'DRESS',
            target_entity_id: id,
            status: 'SUCCESS',
            metadata: { name: deletedDress.name, ip: req.ip }
        });

        res.status(200).json({ message: 'Dress permanently deleted successfully', dress: deletedDress });
    } catch (error) {
        console.error('Controller Error: Could not delete dress.', error.message);
        res.status(500).json({ message: 'Failed to delete dress.', error: error.message });
    }
};


/**
 * @description Links an existing dress to a specific wardrobe.
 */
const linkDressToWardrobe = async (req, res) => {
    try {
        const { wardrobeId, dressId } = req.params;

        // Step 1: Fetch the wardrobe to ensure it exists and to get the user_id for logging.
        const wardrobe = await wardrobeRepository.getWardrobeById(wardrobeId);
        if (!wardrobe) {
            return res.status(404).json({ message: 'Wardrobe not found.' });
        }

        // Step 2: Check if the dress is already in the wardrobe.
        const alreadyExists = await wardrobeDressesRepository.checkDressInWardrobe(wardrobeId, dressId);
        if (alreadyExists) {
            return res.status(409).json({ message: 'This dress is already in the wardrobe.' });
        }

        // Step 3: Create the link in the database.
        const linked = await wardrobeDressesRepository.linkDressToWardrobe(wardrobeId, dressId);

        // Step 4: Log the successful linking action.
        await UserActionsLogController.logAction({
            user_id: wardrobe.user_id,
            action_type: 'LINK_DRESS_TO_WARDROBE',
            source_feature: 'DressManagement',
            target_entity_type: 'WARDROBE_DRESS_LINK',
            target_entity_id: dressId,
            status: 'SUCCESS',
            metadata: { wardrobe_id: wardrobeId, ip: req.ip }
        });

        res.status(201).json({ 
            message: 'Dress linked to wardrobe successfully.', 
            data: linked 
        });

    } catch (error) {
        console.error('Controller Error: Could not link dress to wardrobe.', error.message);
        res.status(500).json({ message: 'Failed to link dress to wardrobe.', error: error.message });
    }
};


/**
 * @description Removes a dress from a specific wardrobe without deleting the dress itself.
 */
const removeDressFromWardrobe = async (req, res) => {
    try {
        const { wardrobeId, dressId } = req.params;

        const wardrobe = await wardrobeRepository.getWardrobeById(wardrobeId);
        if (wardrobe && wardrobe.name === 'Your Dresses') {
            return res.status(403).json({ message: 'Cannot remove a dress from the default "Your Dresses" wardrobe.' });
        }

        const unlinked = await wardrobeDressesRepository.unlinkDressFromWardrobe(wardrobeId, dressId);
        if (!unlinked) {
            return res.status(404).json({ message: 'Link between dress and wardrobe not found.' });
        }
        
        // Log the successful removal
        await UserActionsLogController.logAction({
            user_id: wardrobe.user_id,
            action_type: 'REMOVE_DRESS_FROM_WARDROBE',
            source_feature: 'DressManagement',
            target_entity_type: 'WARDROBE_DRESS_LINK',
            target_entity_id: dressId,
            status: 'SUCCESS',
            metadata: { wardrobe_id: wardrobeId, ip: req.ip }
        });

        res.status(200).json({ message: 'Dress removed from wardrobe successfully.' });
    } catch (error) {
        console.error('Controller Error: Could not remove dress from wardrobe.', error.message);
        res.status(500).json({ message: 'Failed to remove dress from wardrobe.', error: error.message });
    }
};


module.exports = {
    addDress,
    getDressById,
    getDressesByUserId,
    getDressesByWardrobeId,
    updateDressById,
    deleteDressById,
    linkDressToWardrobe,
    removeDressFromWardrobe,
};
