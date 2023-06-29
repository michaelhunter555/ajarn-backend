const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");
const User = require("../../../models/users");
const { validationResult } = require("express-validator");

const addComment = async (req, res, next) => {
  const userId = req.params.uid;
  const blogId = req.params.bid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an error finding the user by Id.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided Id.",
      404
    );
    return next(error);
  }

  const { postComment } = req.body;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error finding the blog post by Id.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "Could not find a blog post by the given Id.",
      404
    );
    return next(error);
  }

  const newComment = {
    name: user.name,
    comment: postComment,
    commentDate: Date.now(),
  };

  blog.comments.push(newComment);

  try {
    await blog.save();
  } catch (err) {
    const error = new HttpError(
      "There was an error confirming the comment transaction.",
      500
    );
    return next(error);
  }

  res.status(201).json({ blogComments: blog.comments, ok: true });
};

module.exports = addComment;
