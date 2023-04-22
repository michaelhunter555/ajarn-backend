const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET all users who consent to have their profile viewed.
const getVisibleUsers = async (req, res, next) => {
  //declare visible users variable
  let visibleUsers;

  //search for visible users - remove passwords from the result
  try {
    visibleUsers = await User.find({}, "-password");
  } catch (err) {
    //if our request is bad, return next error.
    const error = new HttpError(
      "tehre was an issue with retrieving visible users",
      500
    );
    return next(error);
  }
  //return only users who have set their isHidden property to false
  res.json({ users: visibleUsers.filter((user) => !user.isHidden) });
};

module.exports = getVisibleUsers;
