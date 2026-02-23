const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Screenings = new Schema({
  title: { type: String, required: true },
  totalUsersTaken: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  jobId: { type: mongoose.Types.ObjectId, required: true, ref: "Jobs" },
  date: { type: Date, required: true },
  maxTimeAllowed: { type: Number, required: true },
  totalScore: { type: Number, required: true },
  questions: { type: [mongoose.Types.ObjectId], required: true, ref: "ScreeningQuestions" },
});

module.exports = mongoose.model("Screenings", Screenings);