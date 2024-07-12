const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

//GET
const getBlogPostByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  let blog;

  try {
    blog = await Blog.find({ author: userId })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
  } catch (err) {
    const error = new HttpError(
      "There was an error with retrieving blog posts",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "There are currently no blog posts connected to this user Id",
      404
    );
    return next(error);
  }

  const totalBlogPosts = await Blog.countDocuments({ author: userId });
  const totalPages = Math.ceil(totalBlogPosts / limitNum);

  res.status(200).json({ userPosts: blog, pageNum, totalPages, ok: true });
};

module.exports = getBlogPostByUserId;
