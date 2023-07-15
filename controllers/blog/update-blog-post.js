const HttpError = require("../../models/http-error");
const Blog = require("../../models/blog");
const { validationResult } = require("express-validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

//PATCH
const updateBlogPost = async (req, res, next) => {
  const blogId = req.params.bid;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  let blogPost;

  try {
    blogPost = await Blog.findById(blogId);
  } catch (err) {
    const error = new HttpError(
      "There was an error finding the blog post by Id.",
      500
    );
    return next(error);
  }

  if (!blogPost) {
    const error = new HttpError(
      "Could not find a blog post for the provided Id.",
      404
    );
    return next(error);
  }

  if (blogPost.author._id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to update this post.",
      401
    );
    return next(error);
  }

  const { title, category, postContent } = req.body;

  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const sanitizedPostContent = DOMPurify.sanitize(postContent);

  const newUpdatedBlogPost = {
    _id: blogId,
    title: title,
    category: category,
    postContent: sanitizedPostContent,
    editedAt: Date.now(),
  };

  let updatedPost;

  try {
    await Blog.findByIdAndUpdate(blogId, newUpdatedBlogPost);
    updatedPost = await Blog.findById(blogId).populate({
      path: "author",
      model: "Users",
      select: "_id name image",
    });
    updatedPost.save();
  } catch (err) {
    const error = new HttpError(
      "There was an error updating the blog post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ updatedPost: updatedPost, ok: true });
};

module.exports = updateBlogPost;
