const Classroom = require('../models/Classroom');
const User = require('../models/User');
const crypto = require('crypto');

const generateCode = () => crypto.randomBytes(3).toString('hex');

exports.createClassroom = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;  // if using JWT middleware

  try {
    const code = generateCode();
    const classroom = await Classroom.create({
      name,
      description,
      code,
      createdBy: userId,
      members: [userId]
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { classrooms: classroom._id }
    });

    // ✅ UPDATED RESPONSE: Send selected fields including _id
    res.status(201).json({
      message: 'Classroom created',
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        code: classroom.code
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinClassroom = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  try {
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ error: 'Invalid code' });

    if (!classroom.members.includes(userId)) {
      classroom.members.push(userId);
      await classroom.save();

      await User.findByIdAndUpdate(userId, {
        $addToSet: { classrooms: classroom._id }
      });
    }

    // ✅ UPDATED RESPONSE: Send selected fields including _id
    res.json({
      message: 'Joined classroom',
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        code: classroom.code
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyClassrooms = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('classrooms');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ classrooms: user.classrooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
