// /controllers/outfit.controller.js
const outfitRepository = require('../repositories/outfitRepository');

class OutfitController {

     async createOutfit(req, res) {
        // Destructure the linking fields from the request body
        const { wardrobe_id, in_wardrobe, ...outfitData } = req.body;

        try {
            // Step 1: Always create the outfit in MongoDB first.
            const outfit = await outfitRepository.create(outfitData);
            let linkMessage = ""; // To provide feedback on the linking action

            // Step 2: Handle the linking logic based on the provided fields.
            if (wardrobe_id) {
                // Scenario 1: A specific wardrobe_id was provided.
                try {
                    await wardrobeOutfitsRepository.linkOutfitToWardrobe(wardrobe_id, outfit._id);
                    linkMessage = `Outfit successfully linked to wardrobe ${wardrobe_id}.`;
                    console.log(`[OutfitController:createOutfit] ${linkMessage}`);
                } catch (linkError) {
                    console.error(`[OutfitController:createOutfit] Warning: Failed to link outfit ${outfit._id} to wardrobe ${wardrobe_id}.`, linkError.message);
                    linkMessage = `Warning: Outfit was created but failed to link to wardrobe ${wardrobe_id}.`;
                }

            } else if (in_wardrobe === true) {
                // Scenario 2: Link to the default "Your Outfits" wardrobe.
                try {
                    const userWardrobe = await wardrobeRepository.getWardrobeByUserIdByName(outfit.user_id, "Your Outfits");
                    if (userWardrobe) {
                        await wardrobeOutfitsRepository.linkOutfitToWardrobe(userWardrobe.id, outfit._id);
                        linkMessage = `Outfit successfully linked to default 'Your Outfits' wardrobe.`;
                        console.log(`[OutfitController:createOutfit] ${linkMessage}`);
                    } else {
                        linkMessage = "Warning: 'Your Outfits' wardrobe not found for this user. Outfit was created but not linked.";
                        console.warn(`[OutfitController:createOutfit] ${linkMessage}`);
                    }
                } catch (linkError) {
                    console.error(`[OutfitController:createOutfit] Warning: Failed to link outfit ${outfit._id} to default wardrobe.`, linkError.message);
                    linkMessage = `Warning: Outfit was created but failed to link to the default wardrobe.`;
                }

            } else {
                // Scenario 3: No linking requested.
                linkMessage = "Outfit created without being linked to a wardrobe.";
            }

            // Step 3: Send the final success response.
            res.status(201).json({ 
                success: true, 
                message: "Outfit created successfully.", 
                link_status: linkMessage,
                data: outfit 
            });

        } catch (error) {
            console.error('[OutfitController:createOutfit] Fatal Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to create outfit." });
        }
    }

    async getAllOutfits(req, res) {
        try {
            const outfits = await outfitRepository.findAll();
            res.status(200).json({ success: true, data: outfits });
        } catch (error) {
            console.error('[OutfitController:getAllOutfits] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve outfits." });
        }
    }

    async getOutfitById(req, res) {
        try {
            const { id } = req.params;
            const outfit = await outfitRepository.findById(id);
            if (!outfit) {
                return res.status(404).json({ success: false, message: "Outfit not found." });
            }
            res.status(200).json({ success: true, data: outfit });
        } catch (error) {
            console.error('[OutfitController:getOutfitById] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve outfit." });
        }
    }

    async getOutfitsByUserId(req, res) {
        try {
            const { userId } = req.params;
            const outfits = await outfitRepository.findByUserId(userId);
            res.status(200).json({ success: true, data: outfits });
        } catch (error) {
            console.error('[OutfitController:getOutfitsByUserId] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve user's outfits." });
        }
    }

    async getOutfitsByWardrobeId(req, res) {
        try {
            const { wardrobeId } = req.params;
            const outfits = await outfitRepository.findByWardrobeId(wardrobeId);
            res.status(200).json({ success: true, data: outfits });
        } catch (error) {
            console.error('[OutfitController:getOutfitsByWardrobeId] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve wardrobe's outfits." });
        }
    }

    async getOutfitsByDressId(req, res) {
        try {
            const { dressId } = req.params;
            const outfits = await outfitRepository.findByDressComponentId(dressId);
            res.status(200).json({ success: true, data: outfits });
        } catch (error) {
            console.error('[OutfitController:getOutfitsByDressId] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve outfits by dress component." });
        }
    }
}

module.exports = new OutfitController();
