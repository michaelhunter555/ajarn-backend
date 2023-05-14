const HttpError = require("../../models/http-error");
const User = require("../../models/users");

const updateUserRole = async (req, res, next) => {
  //userId from req params
  const userId = req.params.uid;

  //our request expects a userType property
  const { userType } = req.body;

  let user;
  //try to find userId in database
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with finding the user by Id",
      500
    );
    return next(error);
  }
  //if user cannot be found throw an error.
  if (!user) {
    const error = new HttpError(
      "Could not find a user by the given userId",
      404
    );
    return next(error);
  }

  //if the user is set as an employer, has created a creator account & is trying to switch back, throw an error.
  if (userType === "teacher" && user.userType === "employer" && user.creator) {
    const error = new HttpError(
      "You cannot switch back to a teacher if you have a creator profile. Please delete your creator account if you wish to apply for jobs.",
      400
    );
    return next(error);
  }
  //if all is well, then try to update the userType property for user.
  try {
    user = await User.findByIdAndUpdate(
      userId,
      { userType: userType },
      { new: true }
    );
  } catch (err) {
    const error = new HttpError(
      "There was an issue with finding the user by Id",
      500
    );
    return next(error);
  }
  //res successful user object
  res.status(200).json({ user: user });
};

module.exports = updateUserRole;
