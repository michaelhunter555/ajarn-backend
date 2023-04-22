const HttpError = require("../../models/http-error");
const User = require("../../models/users");

//PATCH add credits to user
const addCredits = async (req, res, next) => {
  // Get user ID from request parameters
  const userId = req.params.uid;

  // Get credits from request body
  const { credits } = req.body;

  let user;

  try {
    user = await User.findById(userId);
    //{ ...DUMMY_USERS_LIST.find((u) => u.id === userId) };
  } catch (err) {
    const error = new HttpError(
      "there was an issue with adding credits to this user",
      500
    );
    return next(error);
  }

  //if the user doesn't exist, throw an error
  if (!user) {
    const error = new HttpError("could not find user by this id", 401);
    throw error;
  }

  // Add credits to the user's credits
  user.credits += credits;

  // save the updated user's added credits
  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      "there was an issue with saving the updated user credits",
      500
    );
    return next(error);
  }

  // Send a JSON response with a success message
  res.status(200).json({ message: `added: ${credits} credits` });
};

module.exports = addCredits;
