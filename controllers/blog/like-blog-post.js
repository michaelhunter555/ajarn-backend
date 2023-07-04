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

  console.log("userObj:", user);
  console.log("blogObj", blog);

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

  const userDislikedPostAlready = blog.interactions.some(
    (interaction) =>
      interaction.userId === user._id.toString() && interaction.dislike === true
  );

  let userLikedPost;
  if (userDislikedPostAlready) {
    userLikedPost = {
      userId: userId,
      postId: blogId,
      like: !postLike, // !postLike - if user clicks Like twice it will unlike.
      dislike: false, // set dislike to false
    };
  } else {
    userLikedPost = {
      userId: userId,
      postId: blogId,
      like: !postLike, // !postLike - if user clicks Like twice it will unlike.
    };
  }
  console.log("LIKED POST OBJECT userLikedPost =", userLikedPost);

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    blog.interactions.push(userLikedPost);
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
  const totalLikes = blog.interactions
    ? blog.interactions.filter((interaction) => interaction.like === true)
        .length
    : 0;

  res.status(200).json({ ContentLikes: totalLikes });
};

module.exports = likeContentPost;
