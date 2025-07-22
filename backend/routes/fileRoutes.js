const { GridFsStorage } = require('multer-gridfs-storage');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ClassroomContent = require('../models/ClassroomContent');
const auth = require('../middleware/auth');

// Multer storage config
// MongoDB URI from your .env or fallback
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/paperly';

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({
    bucketName: 'uploads', // GridFS bucket name
    filename: `${Date.now()}-${file.originalname}`,
  }),
});


const upload = multer({ storage });

// POST /api/files/upload/:classroomId
router.post('/upload/:classroomId', auth, upload.single('file'), async (req, res) => {
  try {
    const classroomId = req.params.classroomId;

    const content = new ClassroomContent({
      classroom: classroomId,
      type: 'resource',
      title: req.file.originalname,
      fileId: req.file.id,         
      fileName: req.file.filename, 
      createdBy: req.user._id
    });

    await content.save();
    res.status(201).json({ message: 'File uploaded successfully', content });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// GET /api/files/resources/:classroomId
router.get('/resources/:classroomId', auth, async (req, res) => {
  try {
    const resources = await ClassroomContent.find({
      classroom: req.params.classroomId,
      type: 'resource'
    }).sort({ createdAt: -1 });

    const response = resources.map((resItem) => ({
      fileUrl: resItem.fileUrl,
      originalName: resItem.title
    }));

    res.json(response);
  } catch (err) {
    console.error('Fetch resources error:', err);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
});

module.exports = router;
