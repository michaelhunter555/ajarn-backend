const User = require("../../models/users");
const HttpError = require("../../models/http-error");

const verifyUserEmail = async (req, res, next) => {
  const { token } = req.query;

  let user;

  try {
    user = await User.findOne({ verificationToken: token });
  } catch (err) {
    const error = new HttpError(
      "there was an error with the request to find the token",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("there was an error finding the user", 404);
    return next(error);
  }

  user.isVerified = true;
  user.verificationToken = undefined;

  try {
    await user.save();
    res.status(200).json({ message: "Succesfully verified.", ok: true });
  } catch (err) {
    const error = new HttpError(
      "Error attempting to save verified user. Please check with support."
    );
    return next(error);
  }
};

module.exports = verifyUserEmail;
