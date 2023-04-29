const mongoose = require("mongoose");
const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Job = require("../../models/jobs");
const Application = require("../../models/application");
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
  const { coverLetter } = req.body;

  //declare user and job variables
  let user;
  let job;
  //find our user by id and the job being applied to by id
  try {
    user = await User.findById(userId);
    job = await Job.findById(jobId);
  } catch (err) {
    const error = new HttpError(
      "There was an issue with the request to find the user"
    );
    return next(error);
  }
  //if either the userId or jobId doesn't exist, return next error'
  if (!user || !job) {
    const error = new HttpError(
      "Could not find user or job for the provided ids",
      404
    );
    return next(error);
  }

  //our Application Object takes userId, jobId, resume, coverLetter
  const newApplication = new Application({
    userId,
    jobId,
    resume: [user.resume],
    coverLetter,
  });

  //only teachers can apply to jobs, employers cannot
  if (user.userType !== "teacher") {
    const error = new HttpError("You must be a teacher to apply to jobs.", 404);
    return next(error);
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
    const error = new HttpError(
      `'You may only apply to a job once every 30 days'`,
      404
    );
    return next(error);
  }

  //if not the correct user, throw an error
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  //if not the correct job, throw an error.
  if (!job) {
    throw new HttpError("Job not found", 404);
  }

  //associate application by user and job
  try {
    //state mongoose session
    const sess = await mongoose.startSession();
    //start transaction
    sess.startTransaction();
    //save new application data
    await newApplication.save({ session: sess });
    //push the application to user applications array
    user.applications.push(newApplication);
    //save the user
    await user.save({ session: sess });
    //push the id of the application to the job
    job.applicants.push(newApplication._id);
    //save the job
    await job.save({ session: sess });
    //commit transaction
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was error with the request to apply to the job",
      500
    );
    return next(error);
  }

  //upon succesful submission, render success message.
  res.status(200).json({ message: "Application submitted" });
};

module.exports = applyToJobById;
