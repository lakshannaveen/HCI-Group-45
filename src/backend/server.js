const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if frontend is on different port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture-designer')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Furniture Designer API' });
});

// Auth routes placeholder
app.use('/api/auth', require('./routes/auth'));

// Design routes placeholder
app.use('/api/designs', require('./routes/designs'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});