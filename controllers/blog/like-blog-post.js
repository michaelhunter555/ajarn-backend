const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");
const User = require("../../models/users");
const mongoose = require("mongoose");

//PATCH - like a content post
const likeContentPost = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  //pass boolean in request body
  const { postLike } = req.body;

  let user;
  let blog;
  try {
    user = await User.findOne({ _id: userId });
    blog = await Blog.findOne({ _id: blogId });
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

  const userLikedPostIndex = blog.interactions.findIndex(
    (interaction) =>
      interaction.userId.toString() === userId && interaction.like === true
  );

  const userDislikedPostIndex = blog.interactions.findIndex(
    (interaction) =>
      interaction.userId.toString() === userId && interaction.dislike === true
  );

  let updatedLikes = 0;

  if (userLikedPostIndex === -1) {
    if (userDislikedPostIndex !== -1) {
      blog.interactions.splice(userDislikedPostIndex, 1);
    }

    blog.interactions.push({
      userId: userId,
      postId: blogId,
      like: true, // !postLike - if user clicks Like twice it will unlike.
      dislike: false, // set dislike to false
    });
    updatedLikes = blog.interactions.filter(
      (action) => action.like === true
    ).length;
  } else {
    blog.interactions.splice(userLikedPostIndex, 1);
  }

  updatedLikes = blog.interactions.filter(
    (action) => action.like === true
  ).length;

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    await blog.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log("sess transaction Error:", err);
    const error = new HttpError(
      "There was an error confirming the like content Post transaction.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  res.status(200).json({ ContentLikes: updatedLikes });
};

module.exports = likeContentPost;
