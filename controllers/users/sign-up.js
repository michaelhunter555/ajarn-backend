const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");

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

  //create new instance of User object with required fields
  const createdUser = new User({
    name,
    email,
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    password,
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

  //render json data of new user
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

module.exports = signup;
