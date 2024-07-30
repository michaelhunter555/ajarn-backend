const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  userName: { type: String, required: true },
  datePosted: { type: String, required: true, default: Date.now },
  feedback: { type: String, required: true },
  feedbackType: { type: String, required: true, default: "Employer Guide" },
  reportedJobId: { type: String, required: false, default: "" },
  reportedUserId: { type: String, required: false, default: "" },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
