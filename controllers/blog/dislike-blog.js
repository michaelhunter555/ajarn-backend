const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");
const User = require("../../models/users");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

//PATCH - dislike content post
const dislikeContentPost = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("There was an error during validation", 500);
    return next(error);
  }

  //pass boolean in request body
  const { postDislike } = req.body;

  let user;
  let blog;
  try {
    user = await User.findById(userId);
    blog = await Blog.findById(blogId);
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

  if (!blog) {
    const error = new HttpError("Could not find a blog by the given Id.", 404);
    return next(error);
  }

  const userDislikedPostIndex = blog.interactions.findIndex(
    (interaction) =>
      interaction.userId.toString() === userId && interaction.dislike === true
  );

  const userLikedPostIndex = blog.interactions.findIndex(
    (interaction) =>
      interaction.userId.toString() === userId && interaction.like === true
  );

  let updatedDislikes = 0;

  if (userDislikedPostIndex === -1) {
    if (userLikedPostIndex !== -1) {
      blog.interactions.splice(userLikedPostIndex, 1);
    }
    blog.interactions.push({
      userId: user._id,
      postId: blogId,
      like: false, //set like to false
      dislike: true, // to dislike and undislike a post
    });
    updatedDislikes = blog.interactions.filter(
      (action) => action.dislike === true
    ).length;
  } else {
    blog.interactions.splice(userDislikedPostIndex, 1);
  }
  updatedDislikes = blog.interactions.filter(
    (action) => action.dislike === true
  ).length;

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

  res.status(200).json({ contentDislikes: updatedDislikes });
};

module.exports = dislikeContentPost;
