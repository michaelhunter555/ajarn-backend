const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");
const mongoose = require("mongoose");
const User = require("../../models/users");

//DELETE delete bulk jobs by Id
const bulkDeleteJobsById = async (req, res, next) => {
  const { jobIds } = req.body;

  const jobsArr = Array.isArray(jobIds) ? jobIds : [jobIds];
  const jobArray = jobsArr.map((id) => new mongoose.Types.ObjectId(id));
  //add authentication check here

  let sess;
  try {
    const jobs = await Job.find({ _id: { $in: jobArray } });

    if (!jobs || jobs.length === 0) {
      const error = new HttpError("Jobs not found", 404);
      return next(error);
    }

    for (const job of jobs) {
      if (job.creator._id.toString() !== req.userData.userId) {
        const error = new HttpError(
          "You are not authorized to delete this job.",
          401
        );
        return next(error);
      }
    }

    let user;
    //start mongoose session
    sess = await mongoose.startSession();
    //start transaction
    sess.startTransaction();
    //delete job from database
    await Job.deleteMany({ _id: { $in: jobArray } }, { session: sess });
    //remove job from user id jobs
    user = await User.findById(req.userData.userId).session(sess);
    jobsArr.forEach((jobId) => {
      user.jobs.pull(jobId);
    });
    //save the new user's changes
    await user.save({ session: sess });
    //commit transaction
    await sess.commitTransaction();
    res.status(200).json({ message: "deleted a job", jobs: user.jobs });
  } catch (err) {
    if (sess) {
      sess.abortTransaction();
    }
    console.log(err);
    //return next error if our request has issues
    const error = new HttpError("There was an error with the request", 500);
    return next(error);
  } finally {
    if (sess) {
      sess.endSession();
    }
  }
};

module.exports = bulkDeleteJobsById;
