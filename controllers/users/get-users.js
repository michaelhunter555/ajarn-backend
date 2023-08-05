const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET all users
const getUsers = async (req, res, next) => {
  let user;
  // find all available users - remove password from result
  try {
    //get all users excluding their password
    user = await User.find({ isHidden: false }, "-password");
  } catch (err) {
    const error = new HttpError("there was an error finding the user", 500);
    return next(error);
  }
  //res json object of all users
  res.json({
    ok: true,
    users: user.map((user) => user.toObject({ getters: true })),
  });
};

module.exports = getUsers;
