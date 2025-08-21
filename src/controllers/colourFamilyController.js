// src/controllers/colourFamilyController.js

const colourFamilyRepository = require('../repositories/colourFamilyRepository');

const createColourFamily = async (req, res) => {
  try {
    const { name, hex_value } = req.body;
    if (!name || !hex_value) {
      return res.status(400).json({ message: 'Both name and hex_value are required.' });
    }
    if (!/^#[0-9A-F]{6}$/i.test(hex_value)) {
        return res.status(400).json({ message: 'Invalid hex color format. Use #RRGGBB.' });
    }
    const newColourFamily = await colourFamilyRepository.createColourFamily(name, hex_value);
    res.status(201).json(newColourFamily);
  } catch (error) {
    if (error.code === '23505') {
        return res.status(409).json({ message: 'A colour family with this name already exists.' });
    }
    res.status(500).json({ message: 'Error creating colour family', error: error.message });
  }
};

// --- Added this new function ---
const getAllColourFamilies = async (req, res) => {
  try {
    const allColours = await colourFamilyRepository.getAllColourFamilies();
    res.status(200).json(allColours);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving colour families', error: error.message });
  }
};

const deleteColourFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedColour = await colourFamilyRepository.deleteColourFamilyById(id);
    if (!deletedColour) {
      return res.status(404).json({ message: 'Colour family not found.' });
    }
    res.status(200).json({ message: 'Colour family deleted successfully.', colour: deletedColour });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting colour family', error: error.message });
  }
};

module.exports = {
  createColourFamily,
  getAllColourFamilies, // Exported the new function
  deleteColourFamilyById,
};