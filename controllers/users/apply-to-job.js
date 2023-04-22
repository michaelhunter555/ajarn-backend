const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");

//POST apply to jobs
const applyToJobById = async (req, res, next) => {
  //validate data
  const errors = validationResult(req);

  //if there are any errors throw an error
  if (!errors.isEmpty()) {
    throw new HttpError(
      "You must be a teacher to apply + resume and cover letters must not be empty.",
      500
    );
  }

  //request parameters for dynamic ids
  const userId = req.params.uid;
  const jobId = req.params.jid;

  //destructure request.body
  const { userType, coverLetter } = req.body;

  //declare user and job variables
  let user;
  let job;

  try {
    user = await User.findByIdAndUpdate(userId);
    job = await Job.findByIdAndUpdate(jobId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request to find the user"
    );
    return next(error);
  }

  //only teachers can apply to jobs
  if (user.userType !== "teacher") {
    throw new HttpError("You must be a teacher to apply to jobs.", 404);
  }

  //30 day math calculation from date application is submitted to date (30 days)
  const now = new Date();
  //30 days * 24 hours in a day * 60 minutes in an hours * 60 seconds in a minute * 1000 = 30 days in milliseconds
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  //check for any prior association with current job id within the last 30 days
  const userAppliedAlready = user.applications.some((application) => {
    //check for match by id
    if (application.jobId === jobId) {
      //if there is a match create a new Date object and set it to application date
      const applicationDate = new Date(application.applicationDate);
      //simple subtraction
      const timeSinceLastApplication = now - applicationDate;
      //if it hasn't been at least 30 days, then we return false
      return timeSinceLastApplication <= thirtyDays;
    }
    return false;
  });

  //if true, throw an error because user has applied already.
  if (userAppliedAlready) {
    throw new HttpError(
      `'You may only apply to a job once every 30 days'`,
      500
    );
  }

  //submit resume with unique id and the current date/time.
  const submitResume = {
    applicationDate: new Date().toISOString(),
    name: user.name,
    coverLetter,
    resume: {
      ...user.resume,
      userId: user._id,
    },
  };

  //if not the correct user, throw an error
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  //if not the correct job, throw an error.
  if (!job) {
    throw new HttpError("Job not found", 404);
  }

  //if job.applicants property does not already exist, create one and set to empty arrray;
  if (!job.applicants) {
    job.applicants = [];
  }

  job.applicants.push(submitResume);
  //push the resume to applicants array in job object;
  try {
    await job.save();
  } catch (err) {
    const error = new HttpError("There was error with the request", 500);
    return next(error);
  }

  //if the user is a teacher and they don't have an applications property, create one. Set to empty array.
  if (userType === "teacher") {
    if (!user.applications) {
      user.applications = [];
    }

    //push the resumeId as a reference to the job they applied for.
    user.applications.push({
      jobId: jobId,
      applicationDate: new Date(),
    });
  }

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError("There was error with the request", 500);
    return next(error);
  }

  //upon succesful submission, render success message.
  res.status(200).json({ message: "Application submitted" });
};

module.exports = applyToJobById;
