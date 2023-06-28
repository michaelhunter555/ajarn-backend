const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET
const getBlogPostByUserId = async (req, res, next) => {
  const userId = req.params.pid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an error with retrieving blog posts",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "There are currently no blog posts connected to this user Id",
      404
    );
    return next(error);
  }

  if (user && user.blogPosts.length === 0) {
    const error = new HttpError(
      "There are currently no blog posts connected to this user Id",
      404
    );
    return next(error);
  }

  res.status(200).json({ userPosts: user.blogPosts, ok: true });
};

module.exports = getBlogPostByUserId;
