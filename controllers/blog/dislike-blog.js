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

  let userDislikedPost;
  let userLikedPostAlready = blog.interactions.some(
    (interaction) =>
      interaction.userId === user._id && interaction.like === true
  );

  if (userLikedPostAlready) {
    userDislikedPost = {
      userId: user._id,
      postId: blogId,
      like: false, //set like to false
      dislike: !postDislike, // to dislike and undislike a post
    };
  } else {
    userDislikedPost = {
      userId: user._id,
      postId: blogId,
      dislike: !postDislike, // to dislike and undislike a post
    };
  }

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    blog.interactions.push(userDislikedPost);
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

  const totalDislikes = blog.interactions
    ? blog.interactions.filter((interaction) => interaction.dislike === true)
        .length
    : 0;

  res.status(200).json({ contentDislikes: totalDislikes });
};

module.exports = dislikeContentPost;
