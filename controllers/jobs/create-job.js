const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../../models/users");
const Creator = require("../../models/creator");
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

//job POST
const createJob = async (req, res, next) => {
  //make sure user inputs are valid
  const errors = validationResult(req);
  //if any errors return an error
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError(
      "invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }
  //get userId
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
    credits,
  } = req.body;

  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const sanitizedDescription = DOMPurify.sanitize(description);

  //declare creator variable for Creator object
  let creator;

  try {
    //find creator
    creator = await Creator.findById(userId);
    //declare shouldUpdate as false and only true if our creator data for this job is different
    let shouldUpdate = false;
    //if not the creator we create a new Creator object for that user
    if (!creator) {
      creator = new Creator({
        //Creator id will take userId as a reference
        _id: userId,
        //spread of create data
        ...creatorData,
      });
    } else {
      //get keys of creatorData object and check if the values are different.
      //if they are, update the creator fields.
      //set shoudUpdate to true if any fields are different

      Object.keys(creatorData).forEach((key) => {
        if (creatorData[key] !== creator[key]) {
          creator[key] = creatorData[key];
          shouldUpdate = true;
        }
      });
      //if fields have been changed, save the fields.
      //note changing the fields will update the creator object for each job by user
      if (shouldUpdate) {
        await creator.save();
      }
    }
  } catch (err) {
    //console.log(err);
    const error = new HttpError("Error with finding/creating creator", 500);
    return next(error);
  }

  //declare user variable
  let user;

  try {
    //try to find user by id
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError("Error with creating job request", 500);
    return next(error);
  }

  //if user does not exist in our database, return next error.
  if (!user) {
    const error = new HttpError("User Id issue with creating job request", 404);
    return next(error);
  }

  //check user credits
  if (user.credits < credits) {
    const error = new HttpError("Insufficient credits", 400);
    return next(error);
  }

  //if user has their userType property set to teacher, return next error.
  if (user.userType === "teacher") {
    const error = new HttpError(
      "Only employers can create jobs, please adjust your settings",
      404
    );
    return next(error);
  }

  //in the future for google maps note that location will need lat & lng key.
  const createdJob = new Job({
    datePosted: new Date().toISOString(),
    title,
    location,
    image:
      user.image ||
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJlZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    salary,
    requirements,
    description: sanitizedDescription,
    hours,
    workPermit,
    jobType,
    creator: creator._id,
  });

  //send changes to database
  let sess;
  try {
    //start session
    sess = await mongoose.startSession();
    //start transaction
    sess.startTransaction();
    //save the creator information
    await creator.save({ session: sess });
    //save the created job in sess
    await createdJob.save({ session: sess });
    //push the created job to user jobs
    user.jobs.push(createdJob);
    //subtract total credits
    user.credits = user.credits - credits;
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
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  //res json createJob object
  res
    .status(201)
    .json({ ok: true, job: createdJob.toObject({ getters: true }) });
};

module.exports = createJob;
