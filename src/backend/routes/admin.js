const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Design = require('../models/Design');
const Furniture = require('../models/Furniture');

const router = express.Router();

// Get furniture catalogue (public)
router.get('/furniture/public', async (req, res) => {
  try {
    const furniture = await Furniture.find();
    res.json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Also delete user's designs
    await Design.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all designs (project archives)
router.get('/designs', adminAuth, async (req, res) => {
  try {
    const designs = await Design.find().populate('userId', 'username');
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete design
router.delete('/designs/:id', adminAuth, async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.json({ message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get furniture catalogue
router.get('/furniture', adminAuth, async (req, res) => {
  try {
    const furniture = await Furniture.find();
    res.json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add furniture
router.post('/furniture', adminAuth, async (req, res) => {
  try {
    const { type, label, icon, color, scale } = req.body;
    const furniture = new Furniture({ type, label, icon, color, scale });
    await furniture.save();
    res.status(201).json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update furniture
router.put('/furniture/:id', adminAuth, async (req, res) => {
  try {
    const { type, label, icon, color, scale } = req.body;
    const furniture = await Furniture.findByIdAndUpdate(req.params.id, { type, label, icon, color, scale }, { new: true });
    res.json(furniture);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete furniture
router.delete('/furniture/:id', adminAuth, async (req, res) => {
  try {
    await Furniture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Furniture deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;