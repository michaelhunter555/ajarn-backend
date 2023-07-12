const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");
const User = require("../../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

//PATCH - disike comment post
const dislikeComment = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("There was an error during validation", 500);
    return next(error);
  }

  //pass boolean and commentId in request body
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

  //find the comment
  const comment = blog.comments.find((comment) =>
    comment._id.equals(commentId)
  );

  if (!comment) {
    const error = new HttpError("Could find a comment by the given Id.");
    return next(error);
  }

  //if user interacted with the comment already
  const userInteraction = comment.interactions.find((interaction) =>
    interaction.userId.equals(user._id)
  );

  //check if user already interacted with comment
  if (userInteraction) {
    //if it was already a dislike
    if (userInteraction.dislike) {
      //find the index of that dislike and remove it
      const index = comment.interactions.indexOf(userInteraction);
      comment.interactions.splice(index, 1);
    } else {
      //User already liked comment. So, remove it.
      userInteraction.dislike = true;
      userInteraction.like = false;
    }
  } else {
    //User has no interactions, so create a new one to add dislike.
    comment.interactions.push({
      userId: user._id,
      postId: blogId,
      like: false,
      dislike: true,
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

  //total sum of dislikes
  const totalCommentDislikes = comment.interactions.filter(
    (action) => action.dislike
  ).length;

  res.status(200).json({ commentDislikes: totalCommentDislikes });
};

module.exports = dislikeComment;
