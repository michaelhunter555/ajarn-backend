const Job = require("../../models/jobs");
const mongoose = require("mongoose");

const checkJobExpiration = async () => {
  const today = new Date();
  //if the value exceeds 20 days
  // from time posted until today
  // job should be deleted.
  const maxPostDuration = 20 * 24 * 60 * 60 * 1000;
  //i.e today - 20 days (ms)
  const breakPoint = today.getTime() - maxPostDuration;

  try {
    const job = await Job.find({});
    let removeJobsArr = [];
    job.forEach((job) => {
      const jobPosted = new Date(job.datePosted);
      //jobs created before 20 days will be less than breakpoint
      if (jobPosted.getTime() < breakPoint) {
        //remove the job
        const objectId = new mongoose.Types.ObjectId(job._id);
        removeJobsArr.push(objectId);
      }
    });

    if (removeJobsArr.length > 0) {
      await Job.deleteMany({ _id: { $in: removeJobsArr } });
    }
    console.log("Cron job completed.");
  } catch (err) {
    console.log("Cron job error in job check.");
  }
};

module.exports = checkJobExpiration;
