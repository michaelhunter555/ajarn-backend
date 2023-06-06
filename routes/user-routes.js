const express = require("express");
const router = express.Router();
const getUsers = require("../controllers/users/get-users");
const getVisibleUsers = require("../controllers/users/get-visible-users");
const updateVisibility = require("../controllers/users/update-visibility");
const getUserById = require("../controllers/users/get-user-by-id");
const signup = require("../controllers/users/sign-up");
const login = require("../controllers/users/login");
const updateUserProfile = require("../controllers/users/update-user-profile");
const addCredits = require("../controllers/users/add-credits");
const applyToJobById = require("../controllers/users/apply-to-job");
const updateUserRole = require("../controllers/users/update-user-role");
const updateCreator = require("../controllers/users/update-creator");
const fileUpload = require("../middleware/file-upload");
const { check } = require("express-validator");
const { thaiCities } = require("../dummy_data/ThaiData");

/* GET ROUTES */

//GET all users
router.get("/", getUsers);

//GET all visible users
router.get("/visible-users", getVisibleUsers);

//GET find user by id
router.get("/:uid", getUserById);

/* PATCH ROUTES */

//PATCH add credits
router.patch("/:uid/add-credits", addCredits);

//PATCH update Profile
router.patch(
  "/update-profile/:uid",
  fileUpload.single("image"),
  updateUserProfile
);

/* POST ROUTES */

//POST sign-up post
router.post(
  "/sign-up",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    //password must be at least 7 characters and contain a number
    check("password").isLength({ min: 7 }).matches(/\d/),
  ],
  signup
);

//POST login
router.post(
  "/login",
  [check("email").isEmail(), check("password").not().isEmpty()],
  login
);

//PATCH update profile visiblity
router.patch("/update-visibility/:uid", updateVisibility);

//PATCH update userRole (userType)
router.patch("/update-role/:uid", updateUserRole);

router.patch("/update-creator/:uid", updateCreator);

//POST applyToJob
router.post("/:uid/apply/:jid", applyToJobById);

module.exports = router;
