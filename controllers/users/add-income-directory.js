const Income = require("../../models/income");
const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const mongoose = require("mongoose");

const IncomeDirectoryContribution = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request to find user by Id.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "There was an issue locating the the user by the following id.",
      401
    );
    return next(error);
  }

  const { userIncomeData } = req.body;

  let addContribution;

  if (!user.incomeDirectory && user.userType === "teacher") {
    addContribution = new Income({
      userId: userId,
      ...userIncomeData,
    });

    await addContribution.save();
  } else {
    const error = new HttpError(
      "The income directory is for teachers, not employers."
    );
    return next(error);
  }

  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    await addContribution.save({ session: sess });
    user.incomeDirectory = addContribution;
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "There was an error with the transaction.",
      500
    );
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  res.status(200).json({ user: user, ok: true });
};

module.exports = IncomeDirectoryContribution;
