const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const resumeSchema = require("./resume");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  stripeCustomerId: { type: String, required: false, default: "" },
  password: { type: String, required: true, minlength: 7 },
  email: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  theme: { type: String, default: "light" },
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
  nationality: { type: String, default: "" },
  location: { type: String, default: "" },
  credits: { type: Number, default: 0 },
  education: { type: String, default: "" },
  university: { type: String, default: "" },
  workExperience: { type: String, default: "" },
  coverLetter: { type: String, default: "" },
  resume: { type: [resumeSchema], default: [] },
  blogPosts: [{ type: mongoose.Types.ObjectId, ref: "Blogs" }],
  interests: { type: String, default: "" },
  highestCertification: { type: String, default: "" },
  about: { type: String, default: "" },
  skill: { type: String, default: "" },
  userType: { type: String, default: "teacher" },
  creator: { type: mongoose.Types.ObjectId, default: null, ref: "Creator" },
  applications: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Application" },
  ],
  buffetIsActive: { type: Boolean, default: false },
  buffetStartDate: { type: String, required: false },
  buffetEndDate: { type: String, required: false },
  lastActiveBuffet: { type: Date, required: false },
  incomeDirectory: { type: mongoose.Types.ObjectId, ref: "Income" },
  isHidden: { type: Boolean, default: false },
  jobs: [{ type: mongoose.Types.ObjectId, required: false, ref: "Jobs" }],
  createdJobs: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Jobs" },
  ],
  billingData: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Billing" },
  ],
  recruitmentSent: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Recruitment" },
  ],
  recruitmentReceived: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Recruitment" }, //"Recruitment"
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Users", userSchema);
