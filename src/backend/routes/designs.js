const express = require('express');
const { auth } = require('../middleware/auth');
const Design = require('../models/Design');

const router = express.Router();

// Get all designs for a user
router.get('/', auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id });
    res.json(designs);
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new design
router.post('/', auth, async (req, res) => {
  try {
    const { name, roomData, furniture } = req.body;
    
    // Transform roomData to match schema (handle height->length, color->wallColor)
    const transformedRoomData = {
      width:      roomData.width,
      length:     roomData.length || roomData.height,
      wallColor:  roomData.wallColor || roomData.color || '#FFFFFF',
      floorColor: roomData.floorColor || '#c8b89a',
      shape:      roomData.shape || 'rectangular'
    };
    
    // Ensure furniture array is valid (empty array is ok)
    const furnitureArray = Array.isArray(furniture) ? furniture : [];
    
    const design = new Design({
      userId: req.user.id,
      name: name || 'Untitled Design',
      roomData: transformedRoomData,
      furniture: furnitureArray
    });
    
    await design.save();
    res.status(201).json(design);
  } catch (error) {
    console.error('Error creating design:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : []
    });
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
    
    // Update name if provided
    if (name) design.name = name;
    
    // Transform and update roomData if provided
    if (roomData) {
      design.roomData = {
        width:      roomData.width                                    || design.roomData.width,
        length:     roomData.length     || roomData.height            || design.roomData.length,
        wallColor:  roomData.wallColor  || roomData.color             || design.roomData.wallColor,
        floorColor: roomData.floorColor                               || design.roomData.floorColor || '#c8b89a',
        shape:      roomData.shape                                    || design.roomData.shape,
      };
    }
    
    // Update furniture if provided
    if (furniture !== undefined) {
      design.furniture = Array.isArray(furniture) ? furniture : [];
    }

    await design.save();
    res.json(design);
  } catch (error) {
    console.error('Error updating design:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : []
    });
  }
});

// Delete design
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || design.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Design not found' });
    }

    await design.deleteOne();
    res.json({ message: 'Design deleted' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;