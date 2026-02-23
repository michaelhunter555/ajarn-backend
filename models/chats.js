const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatsSchema = new Schema({
  teacherId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  employerId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  participantInfo: [{
    id: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
    name: { type: String, required: true },
    image: { type: String, required: true },
    userType: { type: String, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
  employerLeftChat: { type: Boolean, default: false },
  teacherLeftChat: { type: Boolean, default: false },
  lastMessage: { type: String, required: false, default: "" },
  lastMessageDate: { type: Date, required: false, default: Date.now },
  chatIsComplete: { type: Boolean, default: false },
});

module.exports = mongoose.model("Chats", ChatsSchema);