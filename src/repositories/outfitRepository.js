// /repositories/outfit.repository.js
const Outfit = require('../models/outfitSchema'); // Adjust path to your Outfit model

class OutfitRepository {

    /**
     * Creates a new outfit in the database.
     * @param {object} outfitData - The data for the new outfit.
     * @returns {Promise<Document>} The newly created outfit document.
     */
    async create(outfitData) {
        try {
            const newOutfit = new Outfit(outfitData);
            await newOutfit.save();
            return newOutfit;
        } catch (error) {
            console.error('[OutfitRepository:create] Error creating outfit:', error);
            throw new Error('Failed to create outfit in repository.');
        }
    }

    /**
     * Retrieves all outfits from the database.
     * @returns {Promise<Array<Document>>} A list of all outfits.
     */
    async findAll() {
        try {
            return await Outfit.find().populate('dress_components.dress_id');
        } catch (error) {
            console.error('[OutfitRepository:findAll] Error finding all outfits:', error);
            throw new Error('Failed to retrieve all outfits from repository.');
        }
    }

    /**
     * Finds a single outfit by its MongoDB ObjectId.
     * @param {string} id - The ObjectId of the outfit.
     * @returns {Promise<Document|null>} The found outfit or null.
     */
    async findById(id) {
        try {
            return await Outfit.findById(id).populate('dress_components.dress_id');
        } catch (error) {
            console.error(`[OutfitRepository:findById] Error finding outfit with ID ${id}:`, error);
            throw new Error('Failed to find outfit by ID in repository.');
        }
    }

    /**
     * Finds all outfits associated with a specific user_id.
     * @param {string} userId - The UUID of the user.
     * @returns {Promise<Array<Document>>} A list of the user's outfits.
     */
    async findByUserId(userId) {
        try {
            return await Outfit.find({ user_id: userId }).populate('dress_components.dress_id');
        } catch (error) {
            console.error(`[OutfitRepository:findByUserId] Error finding outfits for user ${userId}:`, error);
            throw new Error('Failed to find outfits by user ID in repository.');
        }
    }

    /**
     * Finds all outfits associated with a specific wardrobe_id.
     * @param {string} wardrobeId - The UUID of the wardrobe.
     * @returns {Promise<Array<Document>>} A list of outfits in the wardrobe.
     */
    async findByWardrobeId(wardrobeId) {
        try {
            return await Outfit.find({ wardrobe_id: wardrobeId }).populate('dress_components.dress_id');
        } catch (error) {
            console.error(`[OutfitRepository:findByWardrobeId] Error finding outfits for wardrobe ${wardrobeId}:`, error);
            throw new Error('Failed to find outfits by wardrobe ID in repository.');
        }
    }

    /**
     * Finds all outfits that contain a specific dress component.
     * @param {string} dressId - The MongoDB ObjectId of the dress.
     * @returns {Promise<Array<Document>>} A list of outfits containing the dress.
     */
    async findByDressComponentId(dressId) {
        try {
            // Use $elemMatch or a simple dot notation query to find outfits
            // where the dress_components array contains an element with the matching dress_id.
            return await Outfit.find({ 'dress_components.dress_id': dressId }).populate('dress_components.dress_id');
        } catch (error) {
            console.error(`[OutfitRepository:findByDressComponentId] Error finding outfits with dress ${dressId}:`, error);
            throw new Error('Failed to find outfits by dress component ID in repository.');
        }
    }
}

module.exports = new OutfitRepository();
