const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  roomData: {
    width: Number,
    height: Number,
    color: String,
    shape: String
  },
  furniture: [{
    type: {
      type: String, // 'chair', 'table', etc.
      required: true
    },
    position: {
      x: Number,
      y: Number
    },
    size: {
      width: Number,
      height: Number
    },
    color: String,
    scale: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Design', designSchema);