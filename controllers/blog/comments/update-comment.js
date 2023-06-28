const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");
const User = require("../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const updateCommentByPostId = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const { updatedComment } = req.body;

  let blog;
  try {
    blog = await User.findById(blogId);
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

  if (blog.comments.userId.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to udpate this comment",
      401
    );
    return next(error);
  }

  const updateComment = {
    comments: [
      ...blog.comments,
      {
        _id: userId,
        ...updatedComment,
      },
    ],
  };

  let updatedBlogPostComments;

  try {
    await Blog.findByIdAndUpdate(blogId, updateComment);
    updatedBlogPostComments = await Blog.findById(blogId).populate("comments");
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request to update the post comments.",
      500
    );
    return next(error);
  }

  res.status(200).json({ updatedComments: updatedBlogPostComments, ok: true });
};

module.exports = updateCommentByPostId;
