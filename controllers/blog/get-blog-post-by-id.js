const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getBlogPostById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blogPost;

  try {
    blogPost = await Blog.findById(blogId)
      .populate({
        path: "author",
        model: "Users",
        select: "_id name image",
      })
      .populate({
        path: "comments.userId",
        model: "Users",
        select: "name workExperience userType image",
      });
  } catch (err) {
    const error = new HttpError(
      "Error finding the blog post with the provided Id.",
      500
    );
    return next(error);
  }

  if (!blogPost) {
    const error = new HttpError(
      "Could not find a job for the provided job id.",
      404
    );
    return next(error);
  }

  res.json({ blogPost: blogPost.toObject({ getters: true }), ok: true });
};

module.exports = getBlogPostById;
