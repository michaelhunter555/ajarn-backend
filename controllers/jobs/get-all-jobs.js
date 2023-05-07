const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

//GET all Jobs
const getAllJobs = async (req, res, next) => {
  //declare jobs variable
  let jobs;
  //find all job objects
  try {
    jobs = await Job.find({}).populate({
      path: "creator",
      //specify fields to be populated
      select:
        "_id company logoUrl companySize headquarters established presence",
    });
  } catch (err) {
    //if our request is bad return next error
    const error = new HttpError(
      "there was an issue with the finding all jobs request",
      500
    );
    return next(error);
  }
  //organize jobs by date
  const recentJobs = jobs.sort((a, b) => b.datePosted - a.datePosted);

  res.json({ jobs: recentJobs });
};

module.exports = getAllJobs;
