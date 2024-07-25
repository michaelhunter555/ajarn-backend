const HttpError = require("../../../models/http-error");
const Blog = require("../../../models/blog");

const getCommentsByPostId = async (req, res, next) => {
  const blogId = req.params.bid;

  let comments;
  let blog;

  try {
    blog = await Blog.findById(blogId).populate({
      path: "comments.userId",
      model: "Users",
      select:
        "_id name workExperience userType image location highestCertification nationality",
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError("There was an error with the request.", 500);
    return next(error);
  }

  if (!blog) {
    const error = new HttpError("Blog post not found.", 404);
    return next(error);
  }

  comments = blog.comments;

  if (!comments) {
    return;
  }

  res.status(200).json({ comments: comments });
};

module.exports = getCommentsByPostId;
