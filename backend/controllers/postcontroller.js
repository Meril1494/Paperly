const ClassroomContent = require('../models/ClassroomContent'); // ✅ REQUIRED

const addContent = async (req, res) => {
  try {
    const { type, title, content, fileUrl } = req.body;
    const classroomId = req.params.id;
    const userId = req.user?._id || req.userId;

    if (!type || !title || !classroomId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newContent = new ClassroomContent({
      classroom: classroomId,
      type,
      title,
      content,
      fileUrl,
      createdBy: userId
    });

    await newContent.save();
    console.log("✅ SAVED CONTENT:", newContent);

    res.status(201).json({ message: '✅ Content added', content: newContent });

    console.log("📥 Content added");
    console.log("🔎 Request Body:", req.body);
    console.log("🆔 User ID:", userId);

  } catch (error) {
    console.error("❌ Error saving content:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ This was missing
const getClassroomContent = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;

    const contents = await ClassroomContent.find({ classroom: classroomId });

    res.status(200).json(contents);
  } catch (error) {
    console.error("❌ Error fetching classroom content:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ Export both
module.exports = {
  addContent,
  getClassroomContent
};
