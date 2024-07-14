const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recruitmentSchema = new Schema({
  teacherId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: "Creator" },
  jobId: { type: String, required: true, ref: "Creator" },
  jobTitle: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  datePosted: { type: Date, required: true },
  company: { type: String, required: true },
  response: {
    type: String,
    required: true,
    default: "pending",
    enum: ["pending", "interested", "not interested", "declined"],
  },
  declineReason: {
    type: String,
    required: false,
    default: "N/A",
  },
  recruitmentMessage: { type: String, required: true },
});

module.exports = mongoose.model("Recruitment", recruitmentSchema);
