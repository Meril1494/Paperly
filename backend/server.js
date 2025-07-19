const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const path = require('path');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies
app.use('/api/posts', postRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug logger for all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Main API Routes
app.use('/api/auth', authRoutes);         // ➜ handles /register and /login
app.use('/api/files', fileRoutes);        // ➜ handles file upload/sharing
app.use('/api/classrooms', classroomRoutes); // ➜ handles /create and /join classrooms

// ✅ Serve frontend (e.g., index.html and main.js)
// Adjust this path if your frontend files are inside a subfolder (like 'frontend', 'client', or 'public')
const frontendPath = path.join(__dirname, '..'); // change to '..', 'frontend' if needed
app.use(express.static(frontendPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 handler for unknown API routes (keep after frontend serving)
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Optional: error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
