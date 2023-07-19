const HttpError = require("../../models/http-error");
const User = require("../../models/users");

const getJobsByUserId = async (req, res, next) => {
  //get user id through request parameters
  const userId = req.params.uid;

  //declare jobs variable
  let user;
  //try to find the jobs by userid
  try {
    //await job find by userid
    user = await User.findById(userId).populate({
      path: "jobs",
      populate: [
        {
          path: "creator",
          model: "Creator",
        },
        {
          path: "applicants",
          model: "Application",
          populate: {
            path: "userId",
            model: "Users",
            select: "-password",
          },
        },
      ],
    });
  } catch (err) {
    console.log(err);
    //create error variable - return next error for GET request issues
    const error = new HttpError("there was an issue with this request", 500);
    return next(error);
  }

  //error conditions
  if (!user) {
    const error = new HttpError(
      "Could not find a job for the provided user id.",
      404
    );
    return next(error);
  }
  //res jobs by userId
  res.json({ jobs: user.jobs });
};

module.exports = getJobsByUserId;
