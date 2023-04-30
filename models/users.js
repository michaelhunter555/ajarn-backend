const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const resumeSchema = require("./resume");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, minlength: 7 },
  email: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  nationality: { type: String, default: "" },
  location: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  education: { type: String, default: "" },
  workExperience: { type: String, default: "" },
  resume: { type: [resumeSchema], default: [] },
  interests: [{ type: String, default: [] }],
  highestCertification: { type: String, default: "" },
  about: { type: String, default: "" },
  skill: [{ type: String, default: [] }],
  userType: { type: String, default: "teacher" },
  creator: { type: mongoose.Types.ObjectId, ref: "Creator" },
  applications: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Application" },
  ],
  isHidden: { type: Boolean, default: false },
  jobs: [{ type: mongoose.Types.ObjectId, required: false, ref: "Jobs" }],
  createdJobs: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Jobs" },
  ],
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Users", userSchema);
