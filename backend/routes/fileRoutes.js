const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ClassroomContent = require('../models/ClassroomContent');
const auth = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
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
      fileUrl: `/uploads/${req.file.filename}`,
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
