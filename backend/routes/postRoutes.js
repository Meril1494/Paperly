const express = require('express');
const router = express.Router();
const { addContent, getClassroomContent } = require('../controllers/postController');
const auth = require('../middleware/auth');

// Route to add content to a specific classroom (POST)
router.post('/:id/add', auth, addContent);  // :id = classroomId

// Route to get all content by classroom ID (GET)
router.get('/:classroomId', auth, getClassroomContent);

module.exports = router;
