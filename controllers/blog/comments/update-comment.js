const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");
const User = require("../../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const updateCommentByPostId = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("Please make sure all inputs are valid.", 500);
    throw error;
  }

  const { updatedComment } = req.body;

  let blog;
  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request in updating comments.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "Could not find a blog by the associated Id.",
      404
    );
    return next(error);
  }

  const commentIndex = blog.comments.findIndex(
    (c) => c._id.toString() === userId
  );

  if (commentIndex === -1) {
    const error = new HttpError(
      "Could not find the comment by the given Id.",
      404
    );
    return next(error);
  }

  if (blog.comments[commentIndex].userId.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to udpate this comment",
      401
    );
    return next(error);
  }

  blog.comments[commentIndex] = {
    ...blog.comments[commentIndex],
    ...updatedComment,
  };

  try {
    await blog.save();
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request to update the post comments.",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ updatedComments: blog.comments[commentIndex], ok: true });
};

module.exports = updateCommentByPostId;
