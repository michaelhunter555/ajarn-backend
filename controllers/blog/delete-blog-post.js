const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Blog = require("../../models/blog");
const mongoose = require("mongoose");

const deleteBlogPostById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "there was an issue with the request for deleting a blog post.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "there was an issue with finding the Id for deleting this blog post.",
      404
    );
    return next(error);
  }

  if (blog.author._id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to delete this blog post.",
      401
    );
    return next(error);
  }

  let sess;
  let user;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();

    await blog.deleteOne({ _id: blogId }, { session: sess });

    user = await User.findById(blog.author._id);
    await user.blogPosts.pull({ _id: blogId });
    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "There was an error confirming the deletion.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  res.status(200).json({ ok: true, blogPosts: user.blogPosts });
};

module.exports = deleteBlogPostById;
