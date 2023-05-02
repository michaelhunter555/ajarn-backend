const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET userById
const getUserById = async (req, res, next) => {
  //get user by dynamic id we set in routes /:uid
  const userId = req.params.uid;

  //declare user variable
  let user;

  //try to find user and if they have a creator property
  try {
    user = await User.findById(userId);
  } catch (err) {
    //if issues with our call, return next error
    const error = new HttpError("There was an issue with the request", 500);
    return next(error);
  }

  //no match for userId, throw an error
  if (!user) {
    const error = new HttpError("Could not find user by this id.", 404);
    return next(error);
  }

  if (user.creator) {
    try {
      user = await User.findById(userId).populate("creator");
    } catch (err) {
      const error = new HttpError(
        "there was an error populating creator data",
        500
      );
      return next(error);
    }
  }

  //json object of user data
  res.json({ user: user.toObject({ getters: true }) });
};

module.exports = getUserById;
