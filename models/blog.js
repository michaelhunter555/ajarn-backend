const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true },
  postDate: { type: Date, required: true },
  author: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  content: { type: String, required: true },
});
