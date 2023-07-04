const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");
const User = require("../../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

//PATCH - like comment post
const dislikeComment = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("There was an error during validation", 500);
    return next(error);
  }

  //pass boolean and commentId in request body
  const { commentDisliked, commentId } = req.body;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an error finding the user by the given Id.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find the user by the given Id.",
      404
    );
    return next(error);
  }

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error finding the blog by the given Id.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError("Could not find a blog by the given Id.", 404);
    return next(error);
  }

  const commentIndex = blog.comments.findIndex(
    (comment) => comment._id.toString() === commentId
  );

  if (commentIndex === -1) {
    const error = new HttpError("Could find a comment by the given Id.");
    return next(error);
  }

  const comment = blog.comments[commentIndex];

  const userLikedCommentAlready = comment.interactions.some(
    (interaction) =>
      interaction.userId === user._id && interaction.like === true
  );

  let dislikedComment;
  if (userLikedCommentAlready) {
    dislikedComment = {
      userId: user._id,
      postId: blogId,
      like: false,
      dislike: !commentDisliked,
    };
  } else {
    dislikedComment = {
      userId: user._id,
      postId: blogId,
      dislike: !commentDisliked,
    };
  }

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    comment.interactions.push(dislikedComment);
    await blog.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "There was an error confirming the like transaction.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }
  const totalCommentDislikes = comment.interactions.filter(
    (interaction) => interaction.dislike === true
  ).length;

  res.status(200).json({ commentDislikes: totalCommentDislikes });
};

module.exports = dislikeComment;
