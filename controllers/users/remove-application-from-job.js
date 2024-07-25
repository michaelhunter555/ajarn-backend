const User = require("../../models/users");
const Application = require("../../models/application");
const Jobs = require("../../models/jobs");
const mongoose = require("mongoose");

//Let user remove application from job.
const removeApplicationFromJob = async (req, res, next) => {
  const userId = req.params.userId;
  //expect an array of applicationIds
  const { applications } = req.body;

  const checkApplications = Array.isArray(applications)
    ? applications
    : [applications];
  const applicationObjectIds = checkApplications.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  let jobIds = [];
  const applicationDocument = await Application.find({
    _id: { $in: applicationObjectIds },
  });
  for (const application of applicationDocument) {
    if (application.jobId) {
      jobIds.push(application?.jobId);
    }
  }
  let sess;
  //delete the application from the user.
  //delete the applicant from the existing job
  //remove the application document altogether

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();
    //remove the application document
    await Application.deleteMany(
      { _id: { $in: applicationObjectIds } },
      { session: sess }
    );

    //remove applications from user
    const user = await User.findById(userId).session(sess);
    if (user) {
      checkApplications.forEach((id) => {
        user.applications.pull(id);
      });
      await user.save({ session: sess });
    }

    //remove applications from job
    const jobs = await Jobs.find({ _id: { $in: jobIds } }).session(sess);
    await Promise.all(
      jobs.map(async (job) => {
        checkApplications.forEach((id) => job.applicants.pull(id));
        await job.save({ session: sess });
      })
    );
    await sess.commitTransaction();
    res
      .status(200)
      .json({ message: "removed applications successfully.", ok: true });
  } catch (err) {
    console.log(err);
    if (sess) {
      await sess.abortTransaction();
    }
    res.status(500).json({ message: err, ok: false });
  } finally {
    if (sess) {
      await sess.endSession();
    }
  }
};

module.exports = removeApplicationFromJob;
