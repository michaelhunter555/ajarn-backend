const User = require("../../models/users");
const HttpError = require("../../models/http-error");

//PATCH - activate teacher buffet and deduct credits
const activateBuffet = async (req, res, next) => {
  const userId = req.params.uid;

  const { buffetIsActive, lastActiveDate } = req.body;

  let user;

  try {
    //find user by id
    user = await User.findById(userId);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was an issue with the request to activate your buffet.",
      500
    );
    return next(error);
  }

  //if cannot find userId
  if (!user) {
    const error = new HttpError(
      "Could not find a user with the associated Id.",
      401
    );
    return next(error);
  }

  if (user.userType !== "employer") {
    const error = new HttpError(
      "Only employers can view Teacher profiles. If you wish to be an employer, please update your settings.",
      401
    );
    return next(error);
  }

  //to avoid users with active buffets from renewing
  if (user.buffetIsActive === true) {
    const error = new HttpError(
      "Your buffet is already active. Please wait for this one to finish before opening a new one",
      401
    );
    return next(error);
  }

  //check that user as at least 2 credits
  if (user.credits < 2) {
    const error = new HttpError(
      "You do not have enough credits to view Teachers.",
      401
    );
    return next(error);
  }

  try {
    //update buffet to true
    user.buffetIsActive = buffetIsActive;
    user.lastActiveBuffet = lastActiveDate;
    //deduct credits
    user.credits = user.credits - 2;
    //save updates
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "There was an issue with udpating the user profile",
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user });
};

module.exports = activateBuffet;
