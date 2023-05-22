const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const creatorSchema = new Schema({
  _id: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  company: { type: String, required: false },
  logoUrl: { type: String, required: false },
  image: { type: String, default: "" },
  companySize: { type: String, required: false },
  headquarters: { type: String, required: false },
  established: { type: Number, required: false },
  presence: [{ type: String, required: false }],
  about: { type: String, required: false },
});

module.exports = mongoose.model("Creator", creatorSchema);
