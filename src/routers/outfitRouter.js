// /routes/outfit.router.js
const express = require('express');
const router = express.Router();
const outfitController = require('../controllers/outfitController');
const { validateAddOutfit, validateUpdateOutfit } = require('../validators/outfitValidator');

// POST /api/v1/outfits - Create a new outfit
router.post('/createOutfit', validateAddOutfit, outfitController.createOutfit);

// GET /api/v1/outfits - Get all outfits
router.get('/getAllOutfits', outfitController.getAllOutfits);

// GET /api/v1/outfits/:id - Get a single outfit by its MongoDB ObjectId
router.get('/getOutfitById/:id', outfitController.getOutfitById);

// GET /api/v1/outfits/user/:userId - Get all outfits for a specific user
router.get('/getOutfitByUserId/:userId', outfitController.getOutfitsByUserId);

// GET /api/v1/outfits/wardrobe/:wardrobeId - Get all outfits in a specific wardrobe
router.get('/getOutfitsByWardrobeId/:wardrobeId', outfitController.getOutfitsByWardrobeId);

// GET /api/v1/outfits/dress/:dressId - Get all outfits containing a specific dress
router.get('/getOutfitsByDressId/:dressId', outfitController.getOutfitsByDressId);

// Note: You would also add PUT and DELETE routes here, for example:
// router.put('/:id', validateUpdateOutfit, outfitController.updateOutfit);
// router.delete('/:id', outfitController.deleteOutfit);

module.exports = router;
