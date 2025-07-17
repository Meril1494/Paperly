const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Route for signup
router.post('/register', register);

// Route for login
router.post('/login', login);

module.exports = router;
