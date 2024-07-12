const User = require("../../models/users");
const UserBilling = require("../../models/billing");
const HttpError = require("../../models/http-error");

//PATCH - activate teacher buffet and deduct credits
const activateBuffet = async (req, res, next) => {
  const userId = req.params.uid;
  const { buffetType } = req.query;

  const { buffetIsActive, lastActiveDate } = req.body;

  const buffetTypes = {
    "24_HOURS": { credits: 2, time: 1 * 24 * 60 * 60 * 1000 },
    "7_DAYS": { credits: 12, time: 7 * 24 * 60 * 60 * 1000 },
    "14_DAYS": { credits: 25, time: 14 * 24 * 60 * 60 * 1000 },
    "1_MONTH": { credits: 50, time: 30 * 24 * 60 * 60 * 1000 },
  };
  //buffetTypes[buffetType].credits
  //buffetTypes[buffetType].time

  function endTime(endTime) {
    return new Date().getTime() + endTime;
  }

  const userBuffetEndTime = endTime(buffetTypes[buffetType].time);
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
  if (user.credits < buffetTypes[buffetType].credits) {
    const error = new HttpError(
      "You do not have enough credits to view Teachers.",
      401
    );
    return next(error);
  }

  try {
    //update buffet to true
    user.buffetStartDate = new Date().getTime();
    user.buffetEndDate = userBuffetEndTime;
    user.buffetIsActive = buffetIsActive;
    user.lastActiveBuffet = lastActiveDate;
    //deduct credits
    user.credits = user.credits - buffetTypes[buffetType].credits;

    await user.save();

    const billingTransaction = new UserBilling({
      userId,
      purchaseDate: new Date(),
      purchaseAmount: -buffetTypes[buffetType].credits * 100,
      productName: `[CREDITS_USED]*Teacher Buffet (${buffetTypes[buffetType].credits})`,
    });
    await billingTransaction.save();
    //save updates
    res.status(200).json({ user: user });
  } catch (err) {
    const error = new HttpError(
      "There was an issue with udpating the user profile",
      500
    );
    return next(error);
  }
};

module.exports = activateBuffet;
