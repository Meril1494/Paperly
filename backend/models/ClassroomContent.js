const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  type: { type: String, enum: ['post', 'note', 'resource'], required: true },
  title: { type: String, required: true },
  content: { type: String },
  fileUrl: { type: String },
  fileId: { type: mongoose.Schema.Types.ObjectId },  
  fileName: { type: String }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassroomContent', postSchema);
