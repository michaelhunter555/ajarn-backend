const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");

const getCommentLikesById = async (req, res, next) => {
  const blogId = req.params.bid;

  let blog;

  try {
    blog = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request to get all comment Likes"
    );
    return next(error);
  }

  if (!blog) {
    const error = new HttpError(
      "Could not find a blog with the given id.",
      404
    );
    return next(error);
  }

  const totalCommentLikes = blog.comments.map(
    (comment) =>
      comment.interactions.filter((interaction) => interaction.like === true)
        .length
  );

  //console.log(totalCommentLikes.likes);

  res.status(200).json({ totalCommentLikes: totalCommentLikes });
};

module.exports = getCommentLikesById;
