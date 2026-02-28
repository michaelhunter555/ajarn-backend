const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//GET all users
const getUsers = async (req, res, next) => {
  const { page, limit, location, nationality, highestCertification } =
    req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;

  let searchProperty = { isHidden: false };

  if (location) searchProperty.location = location;
  if (nationality) searchProperty.nationality = nationality;
  if (highestCertification) {
    searchProperty.education = highestCertification;
  }

  let user;
  // find all available users - remove password from result
  try {
    //get all users excluding their password
    user = await User.find(searchProperty, "-password")
      .sort({ _id: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalUsers = await User.countDocuments(searchProperty);

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      ok: true,
      users: user.map((user) => user.toObject({ getters: true })),
      totalPages,
      pageNum,
      totalUsers,
      location,
      nationality,
      highestCertification,
    });
  } catch (err) {
    const error = new HttpError("there was an error finding the user", 500);
    return next(error);
  }
};

module.exports = getUsers;
