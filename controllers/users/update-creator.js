const HttpError = require("../../models/http-error");
const Creator = require("../../models/creator");
const User = require("../../models/users");
const { validationResult } = require("express-validator");

const updateCreator = async (req, res, next) => {
  const userId = req.params.uid;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(
      "VALIDATION RESULT ERROR: Please make sure all fields are valid before making changes"
    );
    throw new HttpError(
      "Please make sure all fields are valid before making changes",
      422
    );
  }

  const { creator } = req.body;

  let user;
  try {
    user = await User.findById(userId).populate("creator");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was an error associating the user e-mail with this account",
      500
    );
    return next(error);
  }

  const hasCreatorAccount = user && user.creator !== null;

  if (!hasCreatorAccount && creator) {
    try {
      const newCreator = new Creator({
        company: creator.company,
        logoUrl: creator.logoUrl,
        companySize: creator.companySize,
        headquarters: creator.headquarters,
        established: creator.established,
        presence: creator.presence,
        about: creator.about,
      });
      await newCreator.save();
      user.creator = newCreator;
      await user.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Error with creating a new creator account",
        500
      );
      return next(error);
    }
  } else if (hasCreatorAccount && user.creator._id.toString() === userId) {
    try {
      user.creator.company = creator.company;
      user.creator.logoUrl = creator.logoUrl;
      user.creator.companySize = creator.companySize;
      user.creator.headquarters = creator.headquarters;
      user.creator.established = creator.established;
      user.creator.presence = creator.presence;
      user.creator.about = creator.about;
      await user.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Error with finding an existing creator account to associate with userId",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({ ok: true, user: user });
};

module.exports = updateCreator;
