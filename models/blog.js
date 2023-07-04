const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postInteractions = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Blogs" },
  like: { type: Boolean, required: true, default: false },
  dislike: { type: Boolean, required: true, default: false },
});

const commentInteractions = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Blogs" },
  like: { type: Boolean, required: true, default: false },
  dislike: { type: Boolean, required: true, default: false },
});

const comments = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  comment: { type: String, required: true, default: "" },
  interactions: { type: [commentInteractions], required: false, default: [] },
  commentDate: { type: Date, default: Date.now },
});

const blogSchema = new Schema({
  title: { type: String, required: true },
  name: { type: String, default: "", required: false },
  postDate: { type: Date, default: Date.now },
  author: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  postContent: { type: String, required: true },
  interactions: { type: [postInteractions], required: false, default: [] },
  comments: { type: [comments], required: false, default: [] },
  category: { type: String, required: true, default: "general" },
});

module.exports = mongoose.model("Blogs", blogSchema);
