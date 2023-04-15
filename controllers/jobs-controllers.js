const HttpError = require("../models/http-error");
const dummy_jobs = require("../dummy_data/dummy_jobs");

//get job by id => /api/jobs/${job.id}
const getJobById = (req, res, next) => {
  const jobId = req.params.jid;
  const job = dummy_jobs.find((j) => {
    return String(j.id) === String(jobId);
  });

  if (!job) {
    throw new HttpError("Could not find a job for the provided job id.", 404);
  }
  res.json({ job });
};

//get job by id => /api/jobs/${user.id}
const getJobByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const jobs = dummy_jobs.filter((j) => {
    return j.creator.id === userId;
  });

  if (jobs.length === 0) {
    return next(
      new HttpError("Could not find a job for the provided user id.", 404)
    );
  }

  res.json({ jobs });
};

//job POST
const createJob = (req, res, next) => {
  //list of expected fields for every job post
  const {
    id,
    title,
    location,
    salary,
    requirements,
    description,
    hours,
    workPermit,
    jobType,
    creator,
  } = req.body;

  //in the future for google maps note that location will need lat & lng key.
  const createdJob = {
    id,
    title,
    location,
    salary,
    requirements,
    description,
    hours,
    workPermit,
    jobType,
    creator,
  };

  // pass created job data through object literal and push to dummy_jobs for now.
  dummy_jobs.push(createdJob);
  console.log("Job added:", createdJob); // Debug log
  console.log("Updated dummy_jobs:", dummy_jobs);
  res.status(201).json({ job: createdJob });
};

exports.getJobById = getJobById;
exports.getJobByUserId = getJobByUserId;
exports.createJob = createJob;
