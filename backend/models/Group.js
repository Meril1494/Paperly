const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  groupType: { type: String, enum: ['public', 'private'], required: true },
  joinCode: { type: String },              // for private groups only
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// unique name inside a classroom
groupSchema.index({ classroomId: 1, name: 1 }, { unique: true });
groupSchema.index({ classroomId: 1 });
groupSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Group", groupSchema);
