const express = require("express");
const router = express.Router();
const addNewBlogPost = require("../controllers/blog/add-blog-post");
const getAllBlogPosts = require("../controllers/blog/get-all-blog-posts");
const getBlogPostById = require("../controllers/blog/get-blog-post-by-id");
const getBlogPostByUserId = require("../controllers/blog/get-blog-post-by-user-id");
const updateBlogPostById = require("../controllers/blog/update-blog-post");
const deleteBlogPostById = require("../controllers/blog/delete-blog-post");
const { check } = require("express-validator");
const checkAuth = require("../middleware/auth");
const { blogCategories } = require("../dummy_data/ThaiData");

router.get("/", getAllBlogPosts); //all blog post

router.get("/post/:bid", getBlogPostById); //

router.get("/posts/:uid", getBlogPostByUserId);

router.use(checkAuth);

router.post(
  "new-post/:pid",
  [
    check("title").not().isEmpty(),
    check("postContent").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
  ],
  addNewBlogPost
); //blog post by Id

router.patch(
  "/post/:bid",
  [
    check("title").not().isEmpty(),
    check("postContent").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
  ],
  updateBlogPostById
);

router.delete("/post/:bid", deleteBlogPostById);

module.exports = router;
