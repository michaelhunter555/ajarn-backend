const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//POST update user visibility in results page
const updateVisibility = async (req, res, next) => {
  //request userId params
  const userId = req.params.uid;

  //access isHidden property through destructuring
  const { isHidden } = req.body;

  //declare user variable
  let user;

  //look for that user by id
  try {
    user = await User.findById(userId);
  } catch (err) {
    //throw an error if our request is bad
    const error = new HttpError(
      "there was an issue the request to change visibility",
      500
    );
    return next(error);
  }
  //if not the correct user, return next error
  if (!user) {
    const error = new HttpError(
      "error with updating this user id. Please contact us for assistance.",
      400
    );
    next(error);
  }
  //update isHidden property
  try {
    await User.updateOne({ _id: userId }, { $set: { isHidden: isHidden } });
    user = await User.findById(userId).populate("creator");
  } catch (err) {
    //if our request is bad, return next error
    const error = new HttpError(
      "there was an issue trying to save the changed visibility setting",
      500
    );
    return next(error);
  }
  //return user with isHidden property updated.
  res.status(200).json({ user: user });
};

module.exports = updateVisibility;
