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
  [
    check("userType").custom((val) => {
      const allowedUserType = ["teacher", "employer"];
      return allowedUserType.includes(val);
    }),
  ],
  updateUserProfile
);

/* POST ROUTES */

//POST sign-up post
router.post(
  "/sign-up",
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

//POST applyToJob
router.post(
  "/:uid/apply/:jid",
  [
    check("userType").custom((val) => {
      return val === "teacher";
    }),
    check("resume").not().isEmpty(),
    check("coverLetter").not().isEmpty(),
  ],
  applyToJobById
);

module.exports = router;
