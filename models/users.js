const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resumeSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  company: { type: String, required: false },
  schoolName: { type: String, required: false },
  role: { type: String, required: false },
  location: { type: String, required: false },
  jobTitle: { type: String, required: false },
  from: { type: Number, required: false },
  to: { type: Number, required: false },
});

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, default: true },
  nationality: { type: String, default: "" },
  location: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  education: { type: String, default: "" },
  workExperience: { type: String, default: "" },
  interests: [{ type: String, default: [] }],
  highestCertification: { type: String, default: "" },
  about: { type: String, default: "" },
  skill: [{ type: String, default: [] }],
  resume: [{ type: resumeSchema, default: [] }],
  userType: { type: String, default: "teacher" },
  applications: [{ type: mongoose.Types.ObjectId, required: false }],
  isHidden: { type: Boolean, default: false },
});

module.exports = mongoose.model("Users", userSchema);
