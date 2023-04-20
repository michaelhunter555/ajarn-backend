const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const { check } = require("express-validator");
const { thaiCities } = require("../dummy_data/ThaiData");

/* GET ROUTES */

//GET all users
router.get("/", usersController.getUsers);

//GET all visible users
router.get("/visible-users", usersController.getVisibleUsers);

//GET find user by id
router.get("/:uid", usersController.getUserById);

/* PATCH ROUTES */

//PATCH add credits
router.patch("/:uid/add-credits", usersController.addCredits);

//PATCH update Profile
router.patch(
  "/update-profile/:uid",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("location").custom((val) => {
      return thaiCities.includes(val);
    }),
    check("userType").custom((val) => {
      const allowedUserType = ["teacher", "employer"];
      return allowedUserType.includes(val);
    }),
  ],
  usersController.updateUserProfile
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
  usersController.signup
);

//POST login
router.post(
  "/login",
  [check("email").isEmail(), check("password").not().isEmpty()],
  usersController.login
);

//POST update profile visiblity
router.post("/update-visiblity/:uid", usersController.updateVisiblity);

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
  usersController.applyToJobById
);

module.exports = router;
