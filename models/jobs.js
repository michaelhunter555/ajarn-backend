const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobsSchema = new Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  salary: { type: String, required: true },
  requirements: { type: String, required: true },
  description: { type: String, required: true },
  datePosted: { type: Date, required: true },
  hours: { type: String, required: true },
  workPermit: { type: Boolean, required: true },
  jobType: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "Creator" },
  applicants: [
    { type: mongoose.Types.ObjectId, required: false, ref: "Application" },
  ],
  views: { type: Number, required: false, default: 0 },
});

module.exports = mongoose.model("Jobs", jobsSchema);
