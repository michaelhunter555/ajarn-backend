const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET all users
const getUsers = async (req, res, next) => {
  //
  let user;
  //
  try {
    user = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("there was an error finding the user", 500);
    return next(error);
  }
  res.json({ users: user.map((user) => user.toObject({ getters: true })) });
};

module.exports = getUsers;
