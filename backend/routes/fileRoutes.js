const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');

const ClassroomContent = require('../models/ClassroomContent');
const auth = require('../middleware/auth');

// --- helpers ---
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- DB / Storage config ---
// Force using the same Mongo URI your app uses
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error('MONGO_URI not set. Please set it in .env to use file routes.');
}

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({
    bucketName: 'uploads', // GridFS bucket name
    filename: `${Date.now()}-${file.originalname}`,
    metadata: {
      uploadedBy: req.user?.id || 'unknown',
      classroomId: req.params?.classroomId || null,
      originalName: file.originalname,
      mimeType: file.mimetype,
    },
  }),
});

// File limits and filter
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
    ]);
    if (!allowed.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  },
});

// POST /api/files/upload/:classroomId
// Upload a single file and create a ClassroomContent record
router.post('/upload/:classroomId', auth, upload.single('file'), async (req, res) => {
  try {
    const { classroomId } = req.params;
    if (!isValidId(classroomId)) {
      return res.status(400).json({ message: 'Invalid classroomId' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Build a download URL (served by our /files/:id route below)
    const fileId = req.file.id?.toString?.() || req.file.fileId?.toString?.();
    const fileUrl = `/api/files/${fileId}`;

    const content = new ClassroomContent({
      classroom: classroomId,
      type: 'resource',
      title: req.file.originalname,
      fileId: fileId,
      fileName: req.file.filename,
      fileUrl, // << important for your GET /resources payload
      createdBy: req.user.id,
    });

    await content.save();
    return res.status(201).json({ message: 'File uploaded successfully', content });
  } catch (err) {
    console.error('Upload error:', err);
    // Multer/GridFS errors (e.g., file too large, unsupported type)
    if (err.message && /Unsupported file type|File too large/i.test(err.message)) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error during file upload' });
  }
});

// GET /api/files/resources/:classroomId
// List resource records for a classroom (returns fileUrl + originalName)
router.get('/resources/:classroomId', auth, async (req, res) => {
  try {
    const { classroomId } = req.params;
    if (!isValidId(classroomId)) {
      return res.status(400).json({ message: 'Invalid classroomId' });
    }

    const resources = await ClassroomContent.find({
      classroom: classroomId,
      type: 'resource',
    })
      .sort({ createdAt: -1 })
      .select('fileUrl title createdAt'); // only needed fields

    const response = resources.map((r) => ({
      fileUrl: r.fileUrl,
      originalName: r.title,
      createdAt: r.createdAt,
    }));

    return res.json(response);
  } catch (err) {
    console.error('Fetch resources error:', err);
    return res.status(500).json({ message: 'Server error fetching resources' });
  }
});

// GET /api/files/:id
// Stream/download a file from GridFS
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid file id' });
    }

    // Use native driver bucket from the mongoose connection
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    // Optionally set content-disposition as attachment:
    // res.set('Content-Disposition', 'attachment');

    const _id = new mongoose.Types.ObjectId(id);
    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on('file', (file) => {
      // Set content-type if present
      if (file?.metadata?.mimeType) {
        res.set('Content-Type', file.metadata.mimeType);
      }
    });

    downloadStream.on('error', (e) => {
      console.error('Download error:', e);
      return res.status(404).json({ message: 'File not found' });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('File download error:', err);
    return res.status(500).json({ message: 'Server error downloading file' });
  }
});

module.exports = router;
