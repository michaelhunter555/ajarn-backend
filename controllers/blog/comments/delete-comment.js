const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");
const User = require("../../models/users");
const mongoose = require("mongoose");

const deleteComment = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request to delete the comment.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "There was an error finding a blog by the given Id.",
      404
    );
    return next(error);
  }

  if (blog.comments.userId !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to delete this comment.",
      401
    );
    return next(error);
  }

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    blog.comments.deleteOne({ _id: blogId }, { session: sess });
    await blog.save({ session: sess });
    await sess.commitTransaction();
    await blog.populate("comments");
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request to confirm deletion.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  res.status(200).json({ blogComments: blog.comments, ok: true });
};

module.exports = deleteComment;
