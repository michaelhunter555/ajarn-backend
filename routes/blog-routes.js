const express = require("express");
const router = express.Router();
const addNewBlogPost = require("../controllers/blog/add-blog-post");
const getAllBlogPosts = require("../controllers/blog/get-all-blog-posts");
const getBlogPostById = require("../controllers/blog/get-blog-post-by-id");
const getBlogPostByUserId = require("../controllers/blog/get-blog-post-by-user-id");
const updateBlogPostById = require("../controllers/blog/update-blog-post");
const deleteBlogPostById = require("../controllers/blog/delete-blog-post");
const likeContentPost = require("../controllers/blog/like-blog-post");
const dislikeContentPost = require("../controllers/blog/dislike-blog");
const getPostLikesById = require("../controllers/blog/get-post-likes-by-id");
const getPostDislikesById = require("../controllers/blog/get-post-dislikes-by-id");
const addComment = require("../controllers/blog/comments/add-comment");
const deleteComment = require("../controllers/blog/comments/delete-comment");
const updateComment = require("../controllers/blog/comments/update-comment");
const getCommentsByPostId = require("../controllers/blog/comments/get-comments");
const likeComment = require("../controllers/blog/comments/like-comment");
const dislikeComment = require("../controllers/blog/comments/dislike-comment");
const getCommentDislikesById = require("../controllers/blog/comments/get-comment-dislikes-by-id");
const getCommentLikesById = require("../controllers/blog/comments/get-comment-likes-by-id");
const requireSelf = require("../middleware/require-self");
const { blogWriteLimiter } = require("../middleware/rate-limiters");
const { check } = require("express-validator");
const checkAuth = require("../middleware/auth");
const { blogCategories } = require("../dummy_data/ThaiData");
const toggleUserTheme = require("../controllers/users/toggle-theme");

/*GET Routes */

//get blog
router.get("/", getAllBlogPosts); //all blog post

//GET all comment Likes by blogId
router.get("/post/comments/likes/:bid", getCommentLikesById);

//GET all comment Dislikes by blogId
router.get("/post/comments/dislikes:bid", getCommentDislikesById);

//GET all comments by blogId
router.get("/post/comments/:bid", getCommentsByPostId);

//GET all likes for Post
router.get("/post/likes/:bid", getPostLikesById);

//GET all Dislikes for Post
router.get("/post/dislikes/:bid", getPostDislikesById);

//GET blog post by id
router.get("/post/:bid", getBlogPostById);

//GET all blog posts by user id
router.get("/posts/:uid", getBlogPostByUserId);

/*POST Routes */

router.use(checkAuth);
//POST add a comment
router.post(
  "/add-comment/:uid/post/:bid",
  blogWriteLimiter,
  [check("postComment").not().isEmpty()],
  requireSelf((req) => req.params.uid),
  addComment
);

//POST create blog post
router.post(
  "/new-post/:uid",
  blogWriteLimiter,
  [
    check("title").not().isEmpty(),
    check("category").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
    check("postContent").isLength({ min: 7 }),
  ],
  requireSelf((req) => req.params.uid),
  addNewBlogPost
);

/*PATCH Routes */

//PATCH like Content Post
router.patch("/post/:bid/like/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), likeContentPost);

//PATCH dislike Content Post
router.patch("/post/:bid/dislike/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), dislikeContentPost);

//PATCH like Comment Post
router.patch("/post/:bid/comment/like/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), likeComment);

//PATCH dislike Comment Post
router.patch("/post/:bid/comment/dislike/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), dislikeComment);

//PATCH update blog post
router.patch(
  "/post/:bid/:uid",
  blogWriteLimiter,
  [
    check("title").not().isEmpty(),
    check("category").custom((val) => {
      const allowedCategories = [...blogCategories];
      return allowedCategories.includes(val);
    }),
    check("postContent").isLength({ min: 7 }),
  ],
  requireSelf((req) => req.params.uid),
  updateBlogPostById
);

//PATCH update comment - NOT ACTIVE
router.patch(
  "/update-comment/:uid/post/:bid",
  blogWriteLimiter,
  [check("comment").not().isEmpty()],
  requireSelf((req) => req.params.uid),
  updateComment
);

/*DELETE Routes */

//DELETE delete comment
router.delete("/delete-comment/:cid/post/:bid/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), deleteComment);

//DELETE delete blog post
router.delete("/post/:bid/:uid", blogWriteLimiter, requireSelf((req) => req.params.uid), deleteBlogPostById);

module.exports = router;
