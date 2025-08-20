const subscriptionRepository = require('../repositories/subscriptionRepository');

const createSubscription = async (req, res) => {
    try {
        const newSubscription = await subscriptionRepository.createSubscription(req.body);
        res.status(201).json(newSubscription);
    } catch (error) {
        console.error('[Subscription Controller Error - createSubscription]:', error);
        res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
};

const getAllSubscriptions = async (req, res) => {
    try {
        const { userId } = req.query;
        const subscriptions = await subscriptionRepository.getAllSubscriptions(userId);
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error('[Subscription Controller Error - getAllSubscriptions]:', error);
        res.status(500).json({ message: "Error retrieving subscriptions", error: error.message });
    }
};

const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscriptionRepository.getSubscriptionById(id);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.status(200).json(subscription);
    } catch (error) {
        console.error('[Subscription Controller Error - getSubscriptionById]:', error);
        res.status(500).json({ message: "Error retrieving subscription", error: error.message });
    }
};

const getSubscriptionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const subscriptions = await subscriptionRepository.getSubscriptionsByUserId(userId);
        if (!subscriptions || subscriptions.length === 0) {
            return res.status(404).json({ message: "No subscriptions found for this user" });
        }
        res.status(200).json(subscriptions);
    } catch (error) {
        console.error('[Subscription Controller Error - getSubscriptionsByUserId]:', error);
        res.status(500).json({ message: "Error retrieving user subscriptions", error: error.message });
    }
};

const updateSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSubscription = await subscriptionRepository.updateSubscriptionById(id, req.body);
        if (!updatedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.status(200).json(updatedSubscription);
    } catch (error) {
        console.error('[Subscription Controller Error - updateSubscriptionById]:', error);
        res.status(500).json({ message: "Error updating subscription", error: error.message });
    }
};

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getSubscriptionsByUserId,
    updateSubscriptionById,
};
