const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Messages = new Schema({
  message: { type: String, required: true },
  senderId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  chatId: { type: mongoose.Types.ObjectId, required: true, ref: "Chats" },
}, { timestamps: true });

module.exports = mongoose.model("Messages", Messages);