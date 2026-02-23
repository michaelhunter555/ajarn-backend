const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Blog = require("../../models/blog");
const Application = require("../../models/application");
const Creator = require("../../models/creator");
const Jobs = require("../../models/jobs");
const Income = require("../../models/income");
const requireSelf = require("../../middleware/require-self");

const deleteUserById = async (req, res, next) => {
  const { userId } = req.body;

  if(userId.toString() !== req.userData.userId.toString()){
    const error = new HttpError(
      "Forbidden - You are not authorized to delete this account.",
      403
    );
    return next(error);
  }

  let user;

  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request. Please try again",
      500
    );
    return next(error);
  }

  if(!user){
    const error = new HttpError(
      "User not found",
      404
    );
    return next(error);
  }


  try {
    await Blog.deleteMany({ author: user._id });
    if(user.userType === "employer"){

      await Jobs.deleteMany({ userId: user._id });
    }
    await Application.deleteMany({ creator: user._id });
    await Income.deleteMany({ userId: user._id });
    await Creator.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was an error with deleting data, please try again.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "account successfully Deleted.", ok: true });
};

module.exports = deleteUserById;
