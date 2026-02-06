const express = require('express');
const auth = require('../middleware/auth');
const Design = require('../models/Design');

const router = express.Router();

// Get all designs for a user
router.get('/', auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new design
router.post('/', auth, async (req, res) => {
  try {
    const { name, roomData, furniture } = req.body;
    const design = new Design({
      userId: req.user.id,
      name,
      roomData,
      furniture
    });
    await design.save();
    res.status(201).json(design);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update design
router.put('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || design.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const { name, roomData, furniture } = req.body;
    design.name = name || design.name;
    design.roomData = roomData || design.roomData;
    design.furniture = furniture || design.furniture;

    await design.save();
    res.json(design);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete design
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || design.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Design not found' });
    }

    await design.remove();
    res.json({ message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;