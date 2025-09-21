const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
  company: { type: String, required: false },
  schoolName: { type: String, required: false },
  role: { type: String, required: false },
  location: { type: String, required: false },
  jobTitle: { type: String, required: false },
  from: { type: String, required: false },
  to: { type: String, required: false },
  pdfResume: { type: String, required: false }, // URL to PDF stored in Cloudinary
});

module.exports = resumeSchema;
