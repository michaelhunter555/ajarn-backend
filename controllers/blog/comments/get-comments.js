const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getCommentsByPostId = async (req, res, next) => {
  const blogId = req.params.bid;

  let comments;

  try {
    comments = await Blog.findById(blogId).populate("comments");
  } catch (err) {
    const error = new HttpError("There was an error with the request.", 500);
    return next(error);
  }

  if (comments.length === 0) {
    return;
  }

  res.status(200).json({ comments: comments });
};

module.exports = getCommentsByPostId;
