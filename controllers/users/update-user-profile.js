const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Creator = require("../../models/creator");
const { validationResult } = require("express-validator");

//PATCH update userProfile
const updateUserProfile = async (req, res, next) => {
  //make sure all user inputs satisfy requirements (i.e. email is in email format)
  const errors = validationResult(req);

  //if any errors, throw an error, log the errors as well.
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Please make sure all updated fields are valid", 422);
  }

  //req user id
  const userId = req.params.uid;

  //get existing fields
  const updatedFields = {};

  //create list of existing fields
  const findExistingFields = [
    "name",
    "email",
    "location",
    "nationality",
    "education",
    "workExperience",
    "interests",
    "highestCertification",
    "about",
    "skill",
    "creator",
    "resume",
    "userType",
    "isHidden",
    "coverLetter",
  ];

  //loop over the fields and see if the field is empty or not.
  //if it's not empty, set it equal to existing data to the req.body
  for (const key of findExistingFields) {
    if (req.body[key] !== undefined) {
      updatedFields[key] = req.body[key];
    }
  }

  const imageFile = req.file;
  if (imageFile) {
    updatedFields.image = req.file.path;
  }

  //for handling the deletion of a resume item
  if (req.body.deleteResume) {
    updatedFields.$pull = {
      resume: { _id: req.body.deleteResume },
    };
  }

  //for handling the deletion of a creator account.
  if (req.body.deleteCreator) {
    await Creator.findByIdAndDelete(req.body.deleteCreator);
    updatedFields.creator = null;
  }

  //if user updates the email field, we make sure the email doesn't already exist.
  if (updatedFields.email) {
    //try to see if the email exists
    try {
      //create existingUser variable and try to find email
      const existingUser = await User.findOne({ email: updatedFields.email });
      //if the user exists and the id does not match the userId, return next error
      if (existingUser && existingUser.id !== userId) {
        const error = new HttpError(
          "This email already exists, please try again",
          400
        );
        return next(error);
      }
    } catch (err) {
      //catch if bad request and return next error
      const error = new HttpError(
        "There was an issue with sending the request",
        500
      );
      return next(error);
    }
  }

  //for adding creator property
  const user = await User.findById(userId);
  //check if user has a creator property
  const hasExistingCreator = user && user.creator;
  //if incoming request is for new creator, check if property exists, if not, we create a new one for user.
  if (req.body.creator && !hasExistingCreator) {
    try {
      const newCreator = new Creator({
        ...req.body.creator,
        _id: userId,
      });
      //save new creator profile
      await newCreator.save();
      //update fields for a new creator on user object
      updatedFields.creator = newCreator;
    } catch (err) {
      const error = new HttpError(
        "there was an issue with adding a creator property to your user object",
        500
      );
      return next(error);
    }
  }
  let updatedCreator;
  // If the user already has a creator acct, update the existing one
  if (req.body.creator && hasExistingCreator) {
    try {
      updatedCreator = await Creator.findByIdAndUpdate(
        user.creator._id,
        req.body.creator,

        {
          new: true,
        }
      );
      updatedFields.creator = updatedCreator._id;
    } catch (err) {
      console.error("Error caught while updating creator property", err);
      const error = new HttpError(
        "there was an issue with updating the creator property of your user object",
        500
      );
      return next(error);
    }
  }

  //declare update user variable
  let updatedUser;
  //try to find user by id and update
  try {
    //find our user and updatable fields.
    await User.findByIdAndUpdate(userId, updatedFields);
    //populate creator data for user
    updatedUser = await User.findById(userId).populate({
      path: "creator",
      select: "-creator",
    });
  } catch (err) {
    console.log(err);
    //any issues with our request, return next error
    const error = new HttpError(
      "There was an issue trying to send a request for updating the user",
      500
    );
    return next(error);
  }

  //return updated user as json object
  res.status(200).json({ ok: true, user: updatedUser });
};

module.exports = updateUserProfile;
