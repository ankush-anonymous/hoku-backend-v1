const planRepository = require('../repositories/planRepository');

const createPlan = async (req, res) => {
    try {
        const newPlan = await planRepository.createPlan(req.body);
        res.status(201).json(newPlan);
    } catch (error) {
        console.error('[Plan Controller Error - createPlan]:', error);
        res.status(500).json({ message: "Error creating plan", error: error.message });
    }
};

const getAllPlans = async (req, res) => {
    try {
        // Allow filtering plans by product ID via query parameter
        const { productId } = req.query;
        const plans = await planRepository.getAllPlans(productId);
        res.status(200).json(plans);
    } catch (error) {
        console.error('[Plan Controller Error - getAllPlans]:', error);
        res.status(500).json({ message: "Error retrieving plans", error: error.message });
    }
};

const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await planRepository.getPlanById(id);
        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json(plan);
    } catch (error) {
        console.error('[Plan Controller Error - getPlanById]:', error);
        res.status(500).json({ message: "Error retrieving plan", error: error.message });
    }
};

const updatePlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPlan = await planRepository.updatePlanById(id, req.body);
        if (!updatedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json(updatedPlan);
    } catch (error) {
        console.error('[Plan Controller Error - updatePlanById]:', error);
        res.status(500).json({ message: "Error updating plan", error: error.message });
    }
};

const deletePlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPlan = await planRepository.deletePlanById(id);
        if (!deletedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }
        res.status(200).json({ message: "Plan deleted successfully", planId: deletedPlan.id });
    } catch (error) {
        console.error('[Plan Controller Error - deletePlanById]:', error);
        res.status(500).json({ message: "Error deleting plan", error: error.message });
    }
};

module.exports = {
    createPlan,
    getAllPlans,
    getPlanById,
    updatePlanById,
    deletePlanById,
};
