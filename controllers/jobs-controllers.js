const HttpError = require("../models/http-error");
let dummy_jobs = require("../dummy_data/dummy_jobs");
const { validationResult } = require("express-validator");
const Job = require("../models/jobs");

//GET all Jobs
const getAllJobs = (req, res, next) => {
  res.json({ jobs: dummy_jobs });
};

//GET job by id => /api/jobs/${job.jid}
const getJobById = async (req, res, next) => {
  //get jobId
  const jobId = req.params.jid;

  //declare job variable
  let job;

  //try finding job by Id with await and try catch
  try {
    //await job FindById
    job = await Job.findById(jobId);
  } catch (err) {
    console.log(err);
    //create HttpError and store in variable
    const error = new HttpError(
      "There was an error retriving the provided job id.",
      500
    );
    //return error if there are general problems with our GET request
    return next(error);
  }

  //If the GET request is fine, but we don't have said job id in our database then return error.
  if (!job) {
    const error = new HttpError(
      "Could not find a job for the provided job id.",
      404
    );
    return next(error);
  }

  //res job object
  res.json({ job: job.toObject({ getters: true }) });
};

//GET job by user id => /api/jobs/${user.uid}
const getJobsByUserId = async (req, res, next) => {
  //get user id through request params
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
      "Could not find a job for the provided user id.",
      404
    );
    return next(error);
  }
  //res.json job object
  res.json({ Jobs: jobs.toObject({ getters: true }) });
};

//job POST
const createJob = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("invalid inputs passed, please check your data.", 422);
  }
  const userId = req.params.uid;

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
    creatorData,
  } = req.body;

  //in the future for google maps note that location will need lat & lng key.
  const createdJob = new Job({
    datePosted: new Date().toISOString(),
    title,
    location,
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    salary,
    requirements,
    description,
    hours,
    workPermit,
    jobType,
    creator: {
      _id: userId,
      ...creatorData,
    },
  });

  //pass created job data through object literal and push to dummy_jobs for now.
  try {
    await createdJob.save();
  } catch (err) {
    const error = new HttpError("Creating job failed, please try again", 500);
    return next(error);
  }

  //res json createJob object
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

  //the job at said index will be the updated job (which we find by its index).
  dummy_jobs[jobIndex] = updatedJob;
  res.status(200).json({ job: updatedJob });
};

//DELETE delete job by Id
const deleteJobById = (req, res, next) => {
  //request params for /:jid
  const jobId = req.params.jid;

  //if we can't find a place for this id.
  if (!dummy_jobs.find((j) => j.id === jobId)) {
    throw new HttpError("Could not find a place for that id", 404);
  }

  // simple filter function
  dummy_jobs = dummy_jobs.filter((job) => job.id !== jobId);

  //remove application fom each user that applied

  // DUMMY_USERS_LIST.forEach((user) => {
  //   if (user.applications) {
  //     user.applications = user.applications.filter(
  //       (resume) => resume.jobId !== jobId
  //     );
  //   }
  // });
  res.status(200).json({ message: "deleted a job" });
};

exports.getAllJobs = getAllJobs;
exports.getJobById = getJobById;
exports.getJobsByUserId = getJobsByUserId;
exports.createJob = createJob;
exports.updateJobById = updateJobById;
exports.deleteJobById = deleteJobById;
