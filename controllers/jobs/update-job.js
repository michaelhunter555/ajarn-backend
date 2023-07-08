const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

//PATCH update job by Id
const updateJobById = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("invalid inputs passed, please check your data.", 422);
  }
  const jobId = req.params.jid;

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

  if (job.creator._id.toString() !== req.userData.userId) {
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

  if (updatedFields.description) {
    const window = new JSDOM("").window;
    const DOMPurify = createDOMPurify(window);
    const sanitizedDescription = DOMPurify.sanitize(updatedFields.description);
    updatedFields.description = sanitizedDescription;
  }

  let updatedJob;

  try {
    updatedJob = await Job.findByIdAndUpdate(jobId, updatedFields, {
      new: true,
    });
  } catch (err) {
    console.log("updateJob Error:", err);
    const error = new HttpError(
      "There was an error with the request for updated job.",
      500
    );
    return next(error);
  }

  res.status(200).json({ job: updatedJob.toObject({ getters: true }) });
};

module.exports = updateJobById;
