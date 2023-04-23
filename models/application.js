const mongoose = require("mongoose");
const resumeSchema = require("./resume");
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  jobId: { type: mongoose.Types.ObjectId, required: true, ref: "Jobs" },
  resume: { type: [resumeSchema], required: true },
  coverLetter: { type: String, required: false },
  applicationDate: { type: Date, defualt: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
