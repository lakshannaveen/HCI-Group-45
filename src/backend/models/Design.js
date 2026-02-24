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
    width: {
      type: Number,
      default: 10
    },
    length: {
      type: Number,
      default: 10
    },
    wallColor: {
      type: String,
      default: '#FFFFFF'
    },
    shape: {
      type: String,
      enum: ['rectangular', 'square', 'L-shaped'],
      default: 'rectangular'
    }
  },
  furniture: [{
    id: {
      type: String
    },
    type: {
      type: String
    },
    position: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: Number,
        default: 0
      }
    },
    rotation: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Design', designSchema);