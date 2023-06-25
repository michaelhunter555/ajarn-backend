const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const incomeDirectorySchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  postDate: { type: Date, default: Date.now },
  jobTitle: { type: String, default: "", required: true },
  monthlySalary: { type: String, default: "", required: true },
  educationLevel: { type: String, default: "", required: true },
  lifestyle: { type: String, default: "", required: true },
  monthlySavings: { type: String, default: "", required: true },
  perfectNumber: { type: String, default: "", required: true },
});

module.exports = mongoose.model("Income", incomeDirectorySchema);
