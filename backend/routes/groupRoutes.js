// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Classroom = require('../models/Classroom');
const auth = require('../middleware/auth');

// Create a new group
// Create a new group
// Create a new group
router.post('/create', auth, async (req, res) => {
  console.log('Received request to create group:', req.body);

  const { classroomId, name, description, groupType } = req.body;
  let joinCode = null;

  try {
    if (!classroomId) {
      return res.status(400).json({ message: 'Please select a classroom before creating a group.' });
    }
    if (!name || !groupType) {
      return res.status(400).json({ message: 'Name and groupType are required.' });
    }

    const isPrivate = groupType === 'private';
    if (isPrivate) {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const group = await Group.create({
      classroomId,
      name,
      description,
      groupType,
      isPrivate,
      joinCode,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    return res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error('Group creation error:', err);
    return res.status(500).json({ message: 'Error creating group' });
  }
});

// router.post('/create', auth, async (req, res) => {
//   console.log('Received request to create group:', req.body); // ✅ Debugging log

//   const { classroomId, name, description, isPrivate, groupType } = req.body;
//   let joinCode = null;

//   try {
//     if (isPrivate) {
//       joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//     }

//     const group = new Group({
//       classroomId,
//       name: name,
//       description,
//       isPrivate,
//       joinCode,
//       groupType,
//       createdBy: req.user._id,
//       members: [req.user._id]
//     });

//     await group.save();
//     res.status(201).json({ message: 'Group created successfully', group });
//   } catch (err) {
//     console.error('Group creation error:', err);
//     res.status(500).json({ message: 'Error creating group' });
//   }
// });

// Join a group by ID or join code
router.post('/join', auth, async (req, res) => {
  const { groupId, joinCode } = req.body;
  const normalizedCode = joinCode ? joinCode.toUpperCase() : null;

  try {
    let group = null;

    if (groupId) {
      group = await Group.findById(groupId);
    } else if (normalizedCode) {
      group = await Group.findOne({ joinCode: normalizedCode });
    } else {
      return res.status(400).json({ message: 'Group ID or join code required' });
    }

    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.isPrivate && group.joinCode !== normalizedCode) {
      return res.status(403).json({ message: 'Invalid group code' });
    }

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    res.json({ message: 'Joined group successfully', group });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ message: 'Error joining group' });
  }
});

// Leave a group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ message: 'Error leaving group' });
  }
});

// Delete a group
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this group' });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ message: 'Error deleting group' });
  }
});

module.exports = router;
