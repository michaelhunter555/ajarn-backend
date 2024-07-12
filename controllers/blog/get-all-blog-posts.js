const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getAllBlogPosts = async (req, res, next) => {
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 6;

  let blogPosts;

  try {
    blogPosts = await Blog.find({})
      .sort({ postDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({
        path: "author",
        select: "_id name image userType",
      })
      .lean();
    const mostRecentPosts = blogPosts.sort((a, b) => b.postDate - a.postDate);
    const totalBlogPosts = await Blog.countDocuments({});
    const totalPages = Math.ceil(totalBlogPosts / limitNum);

    res.status(200).json({
      blogList: mostRecentPosts,
      totalBlogPosts,
      totalPages,
      pageNum,
      ok: true,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was an issue with finding blog posts.",
      500
    );
    return next(error);
  }
};

module.exports = getAllBlogPosts;
