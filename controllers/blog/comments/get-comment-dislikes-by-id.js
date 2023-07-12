const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");

const getCommentDislikesById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request for retrieving Comment Dislikes",
      500
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "Could not find a blog with the given Id.",
      404
    );
    return next(error);
  }

  let totalDislikes = blog.comments.interactions.filter(
    (comment) => comment.dislike === true
  ).length;

  res.status(200).json({ commentDislikeCount: totalDislikes });
};

module.exports = getCommentDislikesById;
