const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET all users who consent to have their profile viewed.
const getVisibleUsers = async (req, res, next) => {
  let visibleUsers;

  try {
    visibleUsers = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "tehre was an issue with retrieving visible users",
      500
    );
    return next(error);
  }

  res.json({ users: visibleUsers.filter((user) => !user.isHidden) });
};

module.exports = getVisibleUsers;
