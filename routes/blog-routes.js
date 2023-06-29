const express = require("express");
const router = express.Router();
const addNewBlogPost = require("../controllers/blog/add-blog-post");
const getAllBlogPosts = require("../controllers/blog/get-all-blog-posts");
const getBlogPostById = require("../controllers/blog/get-blog-post-by-id");
const getBlogPostByUserId = require("../controllers/blog/get-blog-post-by-user-id");
const updateBlogPostById = require("../controllers/blog/update-blog-post");
const deleteBlogPostById = require("../controllers/blog/delete-blog-post");
const addComment = require("../controllers/blog/comments/add-comment");
const deleteComment = require("../controllers/blog/comments/delete-comment");
const updateComment = require("../controllers/blog/comments/update-comment");
const { check } = require("express-validator");
const checkAuth = require("../middleware/auth");
const { blogCategories } = require("../dummy_data/ThaiData");

//get blog
router.get("/", getAllBlogPosts); //all blog post

//GET blog post by id
router.get("/post/:bid", getBlogPostById);

//GET all blog posts by user id
router.get("/posts/:uid", getBlogPostByUserId);

//router.get("/post/comments/:bid", getComments);

//POST add a comment
router.post("/add-comment/:uid/post/:bid", checkAuth, addComment);

//POST create blog post
router.post(
  "/new-post/:uid",
  [
    check("title").not().isEmpty(),
    check("category").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
    check("postContent").isLength({ min: 7 }),
  ],
  checkAuth,
  addNewBlogPost
);

//PATCH update blog post
router.patch(
  "/post/:bid",
  [
    check("title").not().isEmpty(),
    check("categories").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
    check("PostContent").isLength({ min: 7 }),
  ],
  checkAuth,
  updateBlogPostById
);

//PATCH update comment
router.patch(
  "/update-comment/:uid/post/:bid",
  [check("comment").not().isEmpty()],
  checkAuth,
  updateComment
);
//DELETE delete comment
router.delete("/delete-comment/:cid/post/:bid", checkAuth, deleteComment);

//DELETE delete blog post
router.delete("/post/:bid", checkAuth, deleteBlogPostById);

module.exports = router;
