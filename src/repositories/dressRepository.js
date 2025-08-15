// dress.repository.js
const Dress = require('../models/dressSchema'); // Your Mongoose Dress model

/**
 * @description Creates a new dress document in MongoDB.
 * @param {object} dressData - The data for the new dress.
 * @returns {Promise<object>} The newly created Mongoose document.
 */
const createDress = async (dressData) => {
    try {
        const newDress = new Dress(dressData);
        await newDress.save();
        return newDress;
    } catch (error) {
        console.error('Mongo Repository Error: Could not create dress.', error);
        throw new Error('Database error during dress creation in MongoDB.');
    }
};

/**
 * @description Finds a single dress by its MongoDB _id.
 * @param {string} id - The MongoDB document ID.
 * @returns {Promise<object|null>} The dress document or null if not found.
 */
const findDressById = async (id) => {
    try {
        // .lean() returns a plain, lightweight JavaScript object, not a full Mongoose document.
        return await Dress.findById(id).lean(); 
    } catch (error) {
        console.error('Mongo Repository Error: Could not find dress by ID.', error);
        throw new Error('Database error while finding dress by ID.');
    }
};

/**
 * @description Finds all dresses belonging to a specific user.
 * @param {string} userId - The user's UUID.
 * @returns {Promise<Array<object>>} An array of dress documents.
 */
const findDressesByUserId = async (userId) => {
    try {
        return await Dress.find({ user_id: userId }).lean();
    } catch (error) {
        console.error('Mongo Repository Error: Could not find dresses by user ID.', error);
        throw new Error('Database error while finding dresses by user ID.');
    }
};

/**
 * @description Finds multiple dresses from an array of MongoDB IDs.
 * This is essential for fetching all dresses in a wardrobe.
 * @param {Array<string>} ids - An array of MongoDB document IDs.
 * @returns {Promise<Array<object>>} An array of dress documents.
 */
const findDressesByIds = async (ids) => {
    try {
        return await Dress.find({ '_id': { $in: ids } }).lean();
    } catch (error) {
        console.error('Mongo Repository Error: Could not find dresses by IDs.', error);
        throw new Error('Database error while finding dresses by IDs.');
    }
};

/**
 * @description Updates a dress document by its MongoDB _id.
 * @param {string} id - The MongoDB document ID.
 * @param {object} updates - The fields to update.
 * @returns {Promise<object|null>} The updated dress document.
 */
const updateDress = async (id, updates) => {
    try {
        // { new: true } ensures the updated document is returned.
        return await Dress.findByIdAndUpdate(id, updates, { new: true }).lean();
    } catch (error) {
        console.error('Mongo Repository Error: Could not update dress.', error);
        throw new Error('Database error during dress update.');
    }
};

/**
 * @description Deletes a dress document by its MongoDB _id.
 * @param {string} id - The MongoDB document ID.
 * @returns {Promise<object|null>} The deleted dress document.
 */
const deleteDress = async (id) => {
    try {
        return await Dress.findByIdAndDelete(id).lean();
    } catch (error) {
        console.error('Mongo Repository Error: Could not delete dress.', error);
        throw new Error('Database error during dress deletion.');
    }
};

module.exports = {
    createDress,
    findDressById,
    findDressesByUserId,
    findDressesByIds,
    updateDress,
    deleteDress,
};
