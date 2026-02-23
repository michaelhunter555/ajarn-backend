const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BillingData = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  purchaseDate: { type: Date, required: true, default: Date.now },
  purchaseAmount: { type: Number, required: true },
  productName: { type: String, required: true, default: "credits purchase" },
});

module.exports = mongoose.model("Billing", BillingData);
