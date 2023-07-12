const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");
const User = require("../../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

// PATCH - like comment post
const likeComment = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("There was an error during validation", 500);
    return next(error);
  }

  // Pass boolean and commentId in request body
  const { commentId } = req.body;

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

  // Find the comment
  const comment = blog.comments.find((comment) =>
    comment._id.equals(commentId)
  );

  if (!comment) {
    const error = new HttpError(
      "Could not find a comment by the given Id.",
      404
    );
    return next(error);
  }

  // Check if user already interacted with the comment
  const userInteraction = comment.interactions.find((interaction) =>
    interaction.userId.equals(user._id)
  );

  // If user interacted with the comment already
  if (userInteraction) {
    if (userInteraction.like) {
      // User liked the comment already. So, remove the like.
      const index = comment.interactions.indexOf(userInteraction);
      comment.interactions.splice(index, 1);
    } else {
      // User disliked the comment. So, remove the dislike and add a like.
      userInteraction.like = true;
      userInteraction.dislike = false;
    }
  } else {
    // User did not interact with the comment yet. So, add a like.
    comment.interactions.push({
      userId: user._id,
      postId: blogId,
      like: true,
      dislike: false,
    });
  }

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
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

  // Sum of comment likes
  const updatedLikes = comment.interactions.filter(
    (action) => action.like
  ).length;

  res.status(200).json({ commentLikes: updatedLikes });
};

module.exports = likeComment;
