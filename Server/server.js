// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming request bodies in a middleware before your handlers

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// --- API Routes ---
// Import route files
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
