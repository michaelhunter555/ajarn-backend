const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const creatorSchema = new Schema({
  _id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  company: { type: String, required: true },
  logoUrl: { type: String, required: true },
  companySize: { type: String, required: true },
  headquarters: { type: String, required: true },
  established: { type: Number, required: true },
  presence: [{ type: String, required: true }],
});

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
  creator: creatorSchema,
});

module.exports = mongoose.model("Jobs", jobsSchema);
