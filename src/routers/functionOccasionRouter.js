// src/routes/eventNameRoutes.js

const express = require('express');
const router = express.Router();
const eventNameController = require('../controllers/functionOccasionController');

// GET /api/v1/events
// Retrieves all event names.
router.get('/getAllEvents', eventNameController.getAllEventNames);

// POST /api/v1/events
// Creates a new event name.
// Request body: { "name": "Cocktail Party" }
router.post('/createEvent', eventNameController.createEventName);

// DELETE /api/v1/events/:id
// Deletes an event name by its UUID.
router.delete('/deleteEventById/:id', eventNameController.deleteEventNameById);

module.exports = router;