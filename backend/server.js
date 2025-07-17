const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');
const cors = require('cors');

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug logger for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Main Routes
app.use('/api/auth', authRoutes);    // ➜ handles /register and /login
app.use('/api/files', fileRoutes);   // ➜ handles file uploading/sharing

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Optional: error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
