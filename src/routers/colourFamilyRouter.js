// src/routes/colourFamilyRoutes.js

const express = require('express');
const router = express.Router();
const colourFamilyController = require('../controllers/colourFamilyController');

// POST /api/v1/colours
// Creates a new colour family.
// Request body: { "name": "Sunset Orange", "hex_value": "#FD6A02" }
router.post("/createColourFamily", colourFamilyController.createColourFamily);

router.get('/getAllColourFamilies', colourFamilyController.getAllColourFamilies);


// DELETE /api/v1/colours/:id
// Deletes a colour family by its UUID.
router.delete('/getColourFamilyById/:id', colourFamilyController.deleteColourFamilyById);

module.exports = router;