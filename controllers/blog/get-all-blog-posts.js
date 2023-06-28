const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getAllBlogPosts = async (req, res, next) => {
  let blogPosts;

  try {
    blogPosts = await Blog.find({}).populate({
      path: "author",
      select: "_id name image",
    });
  } catch (err) {
    const error = new HttpError(
      "There was an issue with finding blog posts.",
      500
    );
    return next(error);
  }

  const mostRecentPosts = blogPosts.sort((a, b) => b.postDate - a.postDate);

  res.status(200).json({ blogList: mostRecentPosts, ok: true });
};

module.exports = getAllBlogPosts;
