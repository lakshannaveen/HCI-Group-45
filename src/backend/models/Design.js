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
    width:      { type: Number, default: 10 },
    length:     { type: Number, default: 10 },
    height:     { type: Number, default: 10 },
    color:      { type: String, default: '#e8e8e8' },
    wallColor:  { type: String, default: '#FFFFFF' },
    floorColor: { type: String, default: '#c8b89a' },
    shape: {
      type: String,
      enum: ['rectangular', 'square', 'L-shaped'],
      default: 'rectangular'
    }
  },
  furniture: [{
    id:    { type: String },
    name:  { type: String },          // display name, e.g. "Chair 2"
    type:  { type: String },          // catalogue type key
    color: { type: String },          // hex colour
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    scale: { type: [Number], default: [1, 1, 1] }  // [W, H, D]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Design', designSchema);
