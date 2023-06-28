const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Blog = require("../../models/blog");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const addNewBlogPost = async (req, res, next) => {
  const userId = req.params.uid;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { title, postContent, category } = req.body;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the POST request.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user with the associated Id.",
      401
    );
    return next(error);
  }

  let newBlogPost;

  try {
    newBlogPost = new Blog({
      title: title,
      name: user.name,
      author: userId,
      postContent: postContent,
      category: category,
      comments: [],
    });
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the POST request.",
      500
    );
    return next(error);
  }

  let sess;
  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    await newBlogPost.save({ session: sess });
    user.blogPosts.push(newBlogPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
    await newBlogPost.populate({
      path: "author",
      model: "Users",
      select: "name _id image",
    });
  } catch (err) {
    const error = new HttpError(
      " There was an issue with associating the blog post with the userId.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  res.status(201).json({ blogPost: newBlogPost, ok: true });
};

module.exports = addNewBlogPost;
