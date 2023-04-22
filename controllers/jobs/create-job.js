const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");

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

module.exports = createJob;
