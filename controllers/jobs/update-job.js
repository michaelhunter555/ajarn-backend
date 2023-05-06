const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");

//PATCH update job by Id
const updateJobById = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("invalid inputs passed, please check your data.", 422);
  }
  const jobId = req.params.jid;
  const creatorId = req.body.creatorId;

  let job;

  try {
    job = await Job.findById(jobId);
  } catch (err) {
    const error = new HttpError(
      `there was an issue finding this job by id`,
      500
    );
    return next(error);
  }

  if (job.creator.toString() !== creatorId) {
    const error = new HttpError("You are not allowed to edit this job", 401);
    return next(error);
  }

  let updatedFields = {};
  const jobFieldsList = ["title", "description", "jobType", "creator"];

  for (let key of jobFieldsList) {
    if (req.body[key] !== undefined) {
      updatedFields[key] = req.body[key];
    }
  }

  let updatedJob;

  try {
    updatedJob = await Job.findByAndUpdate(jobId, updatedFields, {
      new: true,
    });
  } catch (err) {
    const error = new HttpError(
      "There was an error with the request for updated job.",
      500
    );
    return next(error);
  }

  res.status(200).json({ job: updatedJob.toObject({ getters: true }) });
};

module.exports = updateJobById;
