const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../../models/users");
const Creator = require("../../models/creator");

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

  const creator = new Creator({
    _id: userId,
    ...creatorData,
  });

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
    creator: creator._id,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Error with creating job request", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User Id issue with creating job request", 404);
    return next(error);
  }

  if (user.userType === "teacher") {
    const error = new HttpError(
      "Only employers can create jobs, please adjust your settings",
      404
    );
    return next(error);
  }

  //pass created job data through object literal and push to dummy_jobs for now.
  try {
    //start session
    const sess = await mongoose.startSession();
    //start transaction
    sess.startTransaction();
    //save the creator information
    await creator.save({ session: sess });
    //save the created job in sess
    await createdJob.save({ session: sess });
    //push the created job to user jobs
    user.jobs.push(createdJob);
    //save the updated user data
    await user.save({ session: sess });
    //commit transaction
    await sess.commitTransaction();
    //populate creator information
    await createdJob.populate("creator");
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating job failed, please try again", 500);
    return next(error);
  }

  //res json createJob object
  res.status(201).json({ job: createdJob });
};

module.exports = createJob;
