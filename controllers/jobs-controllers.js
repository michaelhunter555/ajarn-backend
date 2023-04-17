const HttpError = require("../models/http-error");
let dummy_jobs = require("../dummy_data/dummy_jobs");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

//GET all Jobs
const getAllJobs = (req, res, next) => {
  res.json({ jobs: dummy_jobs });
};

//GET job by id => /api/jobs/${job.id}
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

//GET job by user id => /api/jobs/${user.id}
const getJobsByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const jobs = dummy_jobs.filter((j) => {
    return j.creator.id === userId;
  });

  if (!jobs || jobs.length === 0) {
    return next(
      new HttpError("Could not find a job for the provided user id.", 404)
    );
  }

  res.json({ jobs });
};

//job POST
const createJob = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("invalid inputs passed, please check your data.", 422);
  }

  //list of expected fields for every job post
  const {
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
    id: uuidv4(),
    datePosted: new Date().toISOString(),
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

//PATCH update job by Id
const updateJobById = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("invalid inputs passed, please check your data.", 422);
  }
  const jobId = req.params.jid;
  //properties that the user can update from our user object.
  const { title, description, jobType } = req.body;

  //don't manipulate original array - create shallow copy.
  const updatedJob = { ...dummy_jobs.find((j) => j.id === jobId) };

  //find the index where the job we want to update is.
  const jobIndex = dummy_jobs.findIndex((j) => j.id === jobId);

  //new field data
  updatedJob.title = title;
  updatedJob.description = description;
  updatedJob.jobType = jobType;

  //the job at said index will be the updated job (which we find by id).
  dummy_jobs[jobIndex] = updatedJob;
  res.status(200).json({ job: updatedJob });
};

//DELETE delete job by Id
const deleteJobById = (req, res, next) => {
  //request params for /:jid
  const jobId = req.params.jid;
  // simple filter function
  dummy_jobs = dummy_jobs.filter((job) => job.id !== jobId);
  res.status(200).json({ message: "deleted a job" });
};

exports.getAllJobs = getAllJobs;
exports.getJobById = getJobById;
exports.getJobsByUserId = getJobsByUserId;
exports.createJob = createJob;
exports.updateJobById = updateJobById;
exports.deleteJobById = deleteJobById;
