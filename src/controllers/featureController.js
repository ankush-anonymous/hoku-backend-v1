const featureRepository = require('../repositories/featureRepository');

const createFeature = async (req, res) => {
    try {
        const newFeature = await featureRepository.createFeature(req.body);
        res.status(201).json(newFeature);
    } catch (error) {
        console.error('[Feature Controller Error - createFeature]:', error);
        res.status(500).json({ message: "Error creating feature", error: error.message });
    }
};

const getAllFeatures = async (req, res) => {
    try {
        const features = await featureRepository.getAllFeatures();
        res.status(200).json(features);
    } catch (error) {
        console.error('[Feature Controller Error - getAllFeatures]:', error);
        res.status(500).json({ message: "Error retrieving features", error: error.message });
    }
};

const getFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const feature = await featureRepository.getFeatureById(id);
        if (!feature) {
            return res.status(404).json({ message: "Feature not found" });
        }
        res.status(200).json(feature);
    } catch (error) {
        console.error('[Feature Controller Error - getFeatureById]:', error);
        res.status(500).json({ message: "Error retrieving feature", error: error.message });
    }
};

const updateFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFeature = await featureRepository.updateFeatureById(id, req.body);
        if (!updatedFeature) {
            return res.status(404).json({ message: "Feature not found" });
        }
        res.status(200).json(updatedFeature);
    } catch (error) {
        console.error('[Feature Controller Error - updateFeatureById]:', error);
        res.status(500).json({ message: "Error updating feature", error: error.message });
    }
};

const deleteFeatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFeature = await featureRepository.deleteFeatureById(id);
        if (!deletedFeature) {
            return res.status(404).json({ message: "Feature not found" });
        }
        res.status(200).json({ message: "Feature deleted successfully", featureId: deletedFeature.id });
    } catch (error) {
        console.error('[Feature Controller Error - deleteFeatureById]:', error);
        res.status(500).json({ message: "Error deleting feature", error: error.message });
    }
};

module.exports = {
    createFeature,
    getAllFeatures,
    getFeatureById,
    updateFeatureById,
    deleteFeatureById,
};
