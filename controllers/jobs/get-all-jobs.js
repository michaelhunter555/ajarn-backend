const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

//GET all Jobs
const getAllJobs = async (req, res, next) => {
  const { page, limit, isHome, location, salary, hours } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 6;

  let jobQuery = {};
  if (location) jobQuery.location = location;
  if (salary) jobQuery.salary = salary;
  if (hours) jobQuery.hours = hours;

  //declare jobs variable
  let jobs;
  //find all job objects
  try {
    const jobsQuery = Job.find(jobQuery)
      .populate({
        path: "creator",
        //specify fields to be populated
        select:
          "_id company logoUrl companySize headquarters established presence image about",
      })
      .populate({
        path: "applicants",
        select: "applicationDate userId",
      })
      .sort({ datePosted: -1 });

    if (isHome === "false") {
      jobsQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    jobs = await jobsQuery.exec();

    const totalJobs = await Job.countDocuments(jobQuery);
    res.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limitNum),
      totalJobs,
    });
  } catch (err) {
    //if our request is bad return next error
    const error = new HttpError(
      "there was an issue with the finding all jobs request",
      500
    );
    return next(error);
  }
};

module.exports = getAllJobs;
