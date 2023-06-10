const dotenv = require("dotenv");
dotenv.config();
const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//POST user sign-up
const signup = async (req, res, next) => {
  //make sure user inputs satisfy requirments
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "Please check check that your inputs match requirements and try again. Passwords must be at least 7 characters long and contain 1 number",
      422
    );
  }
  //we expect name, email and password
  const { name, email, password, userType } = req.body;

  //check if e-mail already exists
  let hasUser;
  //try email
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    //if issue with call, return next error
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  //if user does already exist, return next error
  if (hasUser) {
    const error = new HttpError(
      "A user already exists under the current e-mail.",
      422
    );
    return next(error);
  }

  let encryptPassword;

  try {
    encryptPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user please try again.", 500);
    return next(error);
  }

  //create new instance of User object with required fields
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: encryptPassword,
    userType,
    isHidden: userType === "employer",
  });

  //try to create user
  try {
    await createdUser.save();
  } catch (err) {
    //if issue with call, return next error
    const error = new HttpError("signing up failed, please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "1hr" }
    );
  } catch (err) {
    const error = new HttpError("signing up failed, please try again", 500);
    return next(error);
  }
  //render json data of new user
  res
    .status(201)
    .json({ userId: createdUser._id, email: createdUser.email, token: token });
};

module.exports = signup;
