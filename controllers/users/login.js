const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");

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
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "there was an error with the login request",
      500
    );
    return next(error);
  }

  //if user data does not exist, or the password is incorrect, throw an error.
  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError(
      "there was an issue with logging you in. Check your email or password.",
      404
    );
    return next(error);
  }

  //return user object on success
  res.status(200).json({
    ok: true,
    message: "logged in",
    user: identifiedUser.toObject({ getters: true }),
  });
};

module.exports = login;
