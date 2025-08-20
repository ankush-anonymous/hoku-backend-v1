// /controllers/outfit.controller.js
const outfitRepository = require("../repositories/outfitRepository");

class OutfitController {
  //1. creates outfit
  //2. linking logic:
  // -if in_wardrobe == true -> link it to "Your Outfits"
  // -else just save the outfit in mongoDB
  async createOutfit(req, res) {
    // Destructure the linking fields from the request body
    const { wardrobe_id, in_wardrobe, ...outfitData } = req.body;

    try {
      // Step 1: Always create the outfit in MongoDB first.
      const outfit = await outfitRepository.create(outfitData);
      let linkMessage = ""; // To provide feedback on the linking action

      if (in_wardrobe === true) {
        // Scenario 2: Link to the default "Your Outfits" wardrobe.
        try {
          const userWardrobe =
            await wardrobeRepository.getWardrobeByUserIdByName(
              outfit.user_id,
              "Your Outfits"
            );
          if (userWardrobe) {
            await wardrobeOutfitsRepository.linkOutfitToWardrobe(
              userWardrobe.id,
              outfit._id
            );
            linkMessage = `Outfit successfully linked to default 'Your Outfits' wardrobe.`;
            console.log(`[OutfitController:createOutfit] ${linkMessage}`);
          } else {
            linkMessage =
              "Warning: 'Your Outfits' wardrobe not found for this user. Outfit was created but not linked.";
            console.warn(`[OutfitController:createOutfit] ${linkMessage}`);
          }
        } catch (linkError) {
          console.error(
            `[OutfitController:createOutfit] Warning: Failed to link outfit ${outfit._id} to default wardrobe.`,
            linkError.message
          );
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
        data: outfit,
      });
    } catch (error) {
      console.error(
        "[OutfitController:createOutfit] Fatal Error:",
        error.message
      );
      res
        .status(500)
        .json({ success: false, message: "Failed to create outfit." });
    }
  }

  async getAllOutfits(req, res) {
    try {
      const outfits = await outfitRepository.findAll();
      res.status(200).json({ success: true, data: outfits });
    } catch (error) {
      console.error("[OutfitController:getAllOutfits] Error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve outfits." });
    }
  }

  async getOutfitById(req, res) {
    try {
      const { id } = req.params;
      const outfit = await outfitRepository.findById(id);
      if (!outfit) {
        return res
          .status(404)
          .json({ success: false, message: "Outfit not found." });
      }
      res.status(200).json({ success: true, data: outfit });
    } catch (error) {
      console.error("[OutfitController:getOutfitById] Error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve outfit." });
    }
  }

  async getOutfitsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const outfits = await outfitRepository.findByUserId(userId);
      res.status(200).json({ success: true, data: outfits });
    } catch (error) {
      console.error(
        "[OutfitController:getOutfitsByUserId] Error:",
        error.message
      );
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve user's outfits.",
        });
    }
  }

  async getOutfitsByWardrobeId(req, res) {
    try {
      const { wardrobeId } = req.params;
      const outfits = await outfitRepository.findByWardrobeId(wardrobeId);
      res.status(200).json({ success: true, data: outfits });
    } catch (error) {
      console.error(
        "[OutfitController:getOutfitsByWardrobeId] Error:",
        error.message
      );
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve wardrobe's outfits.",
        });
    }
  }

  async getOutfitsByDressId(req, res) {
    try {
      const { dressId } = req.params;
      const outfits = await outfitRepository.findByDressComponentId(dressId);
      res.status(200).json({ success: true, data: outfits });
    } catch (error) {
      console.error(
        "[OutfitController:getOutfitsByDressId] Error:",
        error.message
      );
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve outfits by dress component.",
        });
    }
  }

  /**
   * @description Links an existing outfit to a specific wardrobe.
   */
  async linkOutfitToWardrobe(req, res) {
    try {
      const { wardrobeId, outfitId } = req.params;

      // Step 1: Fetch the wardrobe to ensure it exists and to get the user_id for logging.
      const wardrobe = await wardrobeRepository.getWardrobeById(wardrobeId);
      if (!wardrobe) {
        return res.status(404).json({ message: "Wardrobe not found." });
      }

      // Step 2: Check if the outfit is already in the wardrobe.
      const alreadyExists =
        await wardrobeOutfitsRepository.checkOutfitInWardrobe(
          wardrobeId,
          outfitId
        );
      if (alreadyExists) {
        return res
          .status(409)
          .json({ message: "This outfit is already in the wardrobe." });
      }

      // Step 3: Create the link in the database.
      const linked = await wardrobeOutfitsRepository.linkOutfitToWardrobe(
        wardrobeId,
        outfitId
      );

      // Step 4: Log the successful linking action.
      await UserActionsLogController.logAction({
        user_id: wardrobe.user_id,
        action_type: "LINK_OUTFIT_TO_WARDROBE",
        source_feature: "OutfitManagement",
        target_entity_type: "WARDROBE_OUTFIT_LINK",
        target_entity_id: outfitId,
        status: "SUCCESS",
        metadata: { wardrobe_id: wardrobeId, ip: req.ip },
      });

      res.status(201).json({
        message: "Outfit linked to wardrobe successfully.",
        data: linked,
      });
    } catch (error) {
      console.error(
        "Controller Error: Could not link outfit to wardrobe.",
        error.message
      );
      res
        .status(500)
        .json({
          message: "Failed to link outfit to wardrobe.",
          error: error.message,
        });
    }
  }

  /**
   * @description Removes an outfit from a specific wardrobe without deleting the outfit itself.
   */
  async unlinkOutfitFromWardrobe(req, res) {
    try {
      const { wardrobeId, outfitId } = req.params;

      // Step 1: Fetch the wardrobe to check its name and get the user_id for logging.
      const wardrobe = await wardrobeRepository.getWardrobeById(wardrobeId);
      if (!wardrobe) {
        return res.status(404).json({ message: "Wardrobe not found." });
      }

      // Step 2: Add a safety check to prevent removal from the default "Your Outfits" wardrobe.
      if (wardrobe.name === "Your Outfits") {
        return res
          .status(403)
          .json({
            message:
              'Cannot remove an outfit from the default "Your Outfits" wardrobe.',
          });
      }

      // Step 3: Unlink the outfit from the wardrobe in the database.
      const unlinked = await wardrobeOutfitsRepository.unlinkOutfitFromWardrobe(
        wardrobeId,
        outfitId
      );
      if (!unlinked) {
        return res
          .status(404)
          .json({ message: "Link between outfit and wardrobe not found." });
      }

      // Step 4: Log the successful removal action.
      await UserActionsLogController.logAction({
        user_id: wardrobe.user_id,
        action_type: "REMOVE_OUTFIT_FROM_WARDROBE",
        source_feature: "OutfitManagement",
        target_entity_type: "WARDROBE_OUTFIT_LINK",
        target_entity_id: outfitId,
        status: "SUCCESS",
        metadata: { wardrobe_id: wardrobeId, ip: req.ip },
      });

      res
        .status(200)
        .json({ message: "Outfit removed from wardrobe successfully." });
    } catch (error) {
      console.error(
        "Controller Error: Could not remove outfit from wardrobe.",
        error.message
      );
      res
        .status(500)
        .json({
          message: "Failed to remove outfit from wardrobe.",
          error: error.message,
        });
    }
  }
}

module.exports = new OutfitController();
