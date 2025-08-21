// src/controllers/eventNameController.js

const eventNameRepository = require('../repositories/eventNameRepository');

const createEventName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Event name is required.' });
    }
    const newEventName = await eventNameRepository.createEventName(name);
    res.status(201).json(newEventName);
  } catch (error) {
    if (error.code === '23505') { // Handles unique constraint violation
        return res.status(409).json({ message: 'An event with this name already exists.' });
    }
    res.status(500).json({ message: 'Error creating event name', error: error.message });
  }
};

const getAllEventNames = async (req, res) => {
  try {
    const allEventNames = await eventNameRepository.getAllEventNames();
    res.status(200).json(allEventNames);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event names', error: error.message });
  }
};

const deleteEventNameById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEventName = await eventNameRepository.deleteEventNameById(id);
    if (!deletedEventName) {
      return res.status(404).json({ message: 'Event name not found.' });
    }
    res.status(200).json({ message: 'Event name deleted successfully.', event: deletedEventName });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event name', error: error.message });
  }
};

module.exports = {
  createEventName,
  getAllEventNames,
  deleteEventNameById,
};