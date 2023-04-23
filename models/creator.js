const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const creatorSchema = new Schema({
  _id: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  company: { type: String, required: true },
  logoUrl: { type: String, required: true },
  companySize: { type: String, required: true },
  headquarters: { type: String, required: true },
  established: { type: Number, required: true },
  presence: [{ type: String, required: true }],
});

module.exports = mongoose.model("Creator", creatorSchema);
