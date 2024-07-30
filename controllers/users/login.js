const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//POST user login
const login = async (req, res, next) => {
  //make sure the user actually enters something
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("please enter a valid email and password");
  }

  //check if user exists
  const { email, password } = req.body;

  //declare variable
  let identifiedUser;

  try {
    //try to find the user by email
    identifiedUser = await User.findOne({ email: email }).populate(
      "applications"
    );
  } catch (err) {
    const error = new HttpError(
      "there was an error with the login request",
      500
    );
    return next(error);
  }

  //if user data does not exist, or the password is incorrect, throw an error.
  if (!identifiedUser) {
    const error = new HttpError(
      "there was an issue with logging you in. Check your email or password.",
      401
    );
    return next(error);
  }

  let isValidPass = false;

  try {
    isValidPass = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new HttpError(
      "there was an issue with logging you in. Check your email or password.",
      500
    );
    return next(error);
  }

  if (!isValidPass) {
    const error = new HttpError("Incorrect Password, please try again.", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: identifiedUser._id,
        email: identifiedUser.email,
        userType: identifiedUser.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );
  } catch (err) {
    const error = new HttpError("login failed, please try again", 500);
    return next(error);
  }

  //return user object on success
  res.status(200).json({
    userId: identifiedUser._id,
    email: identifiedUser.email,
    userType: identifiedUser.userType,
    image: identifiedUser.image,
    buffetIsActive: identifiedUser.buffetIsActive,
    token: token,
    coverLetter: identifiedUser.coverLetter,
    resume: identifiedUser.resume,
    incomeDirectory: identifiedUser.incomeDirectory,
    applications: identifiedUser.applications,
    jobs: identifiedUser.jobs,
    blogPosts: identifiedUser.blogPosts,
    buffetStartDate: identifiedUser.buffetStartDate,
    buffetEndDate: identifiedUser.buffetEndDate,
    theme: identifiedUser.theme,
    name: identifiedUser.name,
  });
};

module.exports = login;
