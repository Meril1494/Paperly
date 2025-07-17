const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Controller
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password, role } = req.body;

  console.log("Login request body:", req.body);

  try {
    // Check for both email and role match
    const user = await User.findOne({ email, role });
    console.log('User found with email & role:', user);

    if (!user) {
      // Debug: Check if user exists with email alone
      const userByEmail = await User.findOne({ email });
      console.log('User found with email only:', userByEmail);

      return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };
