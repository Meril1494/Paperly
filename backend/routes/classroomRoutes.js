const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const classroomController = require('../controllers/classroomController');
const postController = require('../controllers/postController');

router.post('/create', auth, classroomController.createClassroom);
router.post('/join', auth, classroomController.joinClassroom);
router.get('/my', auth, classroomController.getMyClassrooms);
router.post('/:id/add', postController.addContent);



module.exports = router;
