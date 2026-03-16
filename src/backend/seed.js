const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Furniture = require('./models/Furniture');

const seedFurniture = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture-designer');

    const furnitureData = [
      { type: 'chair',         label: 'Chair',         icon: '🪑', color: '#e2844a', scale: [0.7,  1.0,  0.7] },
      { type: 'table',         label: 'Table',         icon: '🪵', color: '#6b4f35', scale: [1.6,  0.5,  1.0] },
      { type: 'sofa',          label: 'Sofa',          icon: '🛋️', color: '#9b59b6', scale: [2.0,  0.8,  0.9] },
      { type: 'wardrobe',      label: 'Wardrobe',      icon: '🗄️', color: '#95a5a6', scale: [1.2,  2.0,  0.6] },
      { type: 'bed',           label: 'Bed',           icon: '🛏️', color: '#3498db', scale: [1.4,  0.5,  2.0] },
      { type: 'lamp',          label: 'Lamp',          icon: '💡', color: '#e2c94a', scale: [0.4,  1.5,  0.4] },
      { type: 'dining-table',  label: 'Dining Table',  icon: '🍽️', color: '#8B4513', scale: [1.8,  0.5,  0.9] },
      { type: 'bookshelf',     label: 'Bookshelf',     icon: '📚', color: '#DEB887', scale: [1.0,  1.8,  0.3] },
      { type: 'desk',          label: 'Desk',          icon: '🖥️', color: '#A0522D', scale: [1.2,  0.5,  0.7] },
      { type: 'coffee-table',  label: 'Coffee Table',  icon: '☕', color: '#D2691E', scale: [0.9,  0.4,  0.5] },
    ];

    for (const item of furnitureData) {
      const existing = await Furniture.findOne({ type: item.type });
      if (!existing) {
        await Furniture.create(item);
        console.log(`Seeded ${item.type}`);
      } else {
        console.log(`Already exists: ${item.type}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
};

seedFurniture();
