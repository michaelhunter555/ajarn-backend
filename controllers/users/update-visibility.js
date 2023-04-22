const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//POST update user visibility in results page
const updateVisibility = async (req, res, next) => {
  const userId = req.params.uid;

  const { isHidden } = req.body;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "there was an issue the request to change visibility",
      500
    );
    return next(error);
  }

  if (!user) {
    throw new HttpError(
      "error with updating this user id. Please contact us for assistance.",
      400
    );
  }
  user.isHidden = isHidden;

  try {
    await User.updateOne({ _id: userId }, { $set: { isHidden: isHidden } });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "there was an issue trying to save the changed visibility setting",
      500
    );
    return next(error);
  }
  res.status(200).json({ user: user });
};

module.exports = updateVisibility;
