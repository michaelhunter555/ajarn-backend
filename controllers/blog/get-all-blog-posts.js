const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");

const getAllBlogPosts = async (req, res, next) => {
  const { page, limit, searchQuery, date, category } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 6;

  const userQuery = {};

  const searchQueryString =
  typeof searchQuery === "string" &&
  searchQuery !== "undefined" &&
  searchQuery !== "null"
    ? searchQuery.trim()
    : "";

  const dateString = new Date(date);
  if(!isNaN(dateString.getTime())) {
    userQuery.postDate = { $gte: dateString };
  }

  const categoryString =
  typeof category === "string" &&
  category !== "undefined" &&
  category !== "null" && category !== "Any"
    ? category.trim()
    : "";

  if(categoryString !== "") {
    userQuery.category = categoryString;
  }

  if(searchQueryString !== "") {
    userQuery.$or = [
      { title: { $regex: searchQueryString, $options: "i" } },
      { category: { $regex: searchQueryString, $options: "i" } },
    ];
  }

  let blogPosts;

  try {
    blogPosts = await Blog.find(userQuery)
      .sort({ postDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({
        path: "author",
        select: "_id name image userType",
      })
      .lean();

    const totalBlogPosts = await Blog.countDocuments(userQuery);
    const totalPages = Math.ceil(totalBlogPosts / limitNum);

    res.status(200).json({
      blogList: blogPosts,
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
