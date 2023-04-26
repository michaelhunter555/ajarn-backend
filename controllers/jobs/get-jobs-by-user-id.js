const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

const getJobsByUserId = async (req, res, next) => {
  //get user id through request parameters
  const userId = req.params.uid;

  //declare jobs variable
  let jobs;
  //try to find the jobs by userid
  try {
    //await job find by userid
    jobs = await Job.find({ creator: userId });
  } catch (err) {
    //create error variable - return next error for GET request issues
    const error = new HttpError("there was an issue with this request", 500);
    return next(error);
  }

  //error conditions
  if (!jobs || jobs.length === 0) {
    const error = new HttpError(
      "Could not find sjob for the provided user id.",
      404
    );
    return next(error);
  }
  //res jobs by userId
  res.json({ jobs: jobs.toObject({ getters: true }) });
};

module.exports = getJobsByUserId;
