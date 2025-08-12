// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const auth = require('../middleware/auth');

// Create a new group
// Create a new group
router.post('/create', auth, async (req, res) => {
  console.log('Received request to create group:', req.body); // ✅ Debugging log

  const { classroomId, name, description, isPrivate, groupType } = req.body;
  let joinCode = null;

  try {
    if (isPrivate) {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const group = new Group({
      classroomId,
      name: name,
      description,
      isPrivate,
      joinCode,
      groupType,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error('Group creation error:', err);
    res.status(500).json({ message: 'Error creating group' });
  }
});

// Join a group (with or without code)
router.post('/join', auth, async (req, res) => {
  const { groupId, joinCode } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.isPrivate && group.joinCode !== joinCode) {
      return res.status(403).json({ message: 'Invalid group code' });
    }

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ message: 'Error joining group' });
  }
});

module.exports = router;
