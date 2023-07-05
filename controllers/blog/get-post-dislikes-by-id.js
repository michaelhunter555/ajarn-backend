const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getPostDislikesById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request for finding like counts.",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "Could not find a blog post for the given blog Id",
      404
    );
    return next(error);
  }

  const totalDislikes = blog.interactions.filter(
    (action) => action.dislike === true
  ).length;

  res.status(200).json({ postDislikeCount: totalDislikes });
};

module.exports = getPostDislikesById;
