const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  scale: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 3;
      },
      message: 'Scale must be an array of 3 numbers'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Furniture', furnitureSchema);