const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Define routes correctly with function handlers
router.get('/files', fileController.getFiles);
router.post('/upload', fileController.uploadFile);

module.exports = router;
