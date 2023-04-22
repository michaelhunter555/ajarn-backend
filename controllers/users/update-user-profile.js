const HttpError = require("../../models/http-error");
const User = require("../../models/users");
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
    "resume",
    "userType",
  ];

  //loop over the fields and see if the field is empty or not.
  //if it's not empty, add it to existing data to the req.body
  for (const key of findExistingFields) {
    if (req.body[key] !== undefined) {
      updatedFields[key] = req.body[key];
    }
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

  //declare update user variable
  let updatedUser;

  //try to find user by id and update
  try {
    //find our user, updatable fields and set new to true to ensure a new an updated document in the response.
    updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });
  } catch (err) {
    //any issues with our request, return next error
    const error = new HttpError(
      "There was an issue trying to send a request for updating the user",
      500
    );
    return next(error);
  }

  //return updated user as json object
  res.status(200).json({ user: updatedUser });
};

module.exports = updateUserProfile;
