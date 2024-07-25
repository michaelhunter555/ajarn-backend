const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const mongoose = require("mongoose");
const User = require("../../models/users");

//DELETE delete job by Id
const deleteJobById = async (req, res, next) => {
  //request params for /:jid
  const jobId = req.params.jid;

  //declare job to delete variable
  let job;

  //find job by id and delete
  try {
    job = await Job.findById(jobId).populate("creator");
  } catch (err) {
    //if bad request, return next error
    const error = new HttpError("There was an error with the request", 500);
    return next(error);
  }

  //if null, no job was found for that id
  if (!job) {
    const error = new HttpError("Could not find a place for that id", 404);
    return next(error);
  }

  //add authentication check here
  if (job.creator._id.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not authorized to delete this job.",
      401
    );
    return next(error);
  }
  //delete image from cloudinary

  let sess;
  let user;
  try {
    //start mongoose session
    sess = await mongoose.startSession();
    //start transaction
    sess.startTransaction();
    //delete job from database
    await job.deleteOne({ _id: jobId }, { session: sess });
    //remove job from user id jobs
    user = await User.findById(job.creator._id);
    user.jobs.pull({ _id: jobId });
    //save the new user's changes
    await user.save({ session: sess });
    //commit transaction
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    //return next error if our request has issues
    const error = new HttpError("There was an error with the request", 500);
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  //confirm job is deleted message
  res.status(200).json({ message: "deleted a job", jobs: user.jobs });
};

module.exports = deleteJobById;
