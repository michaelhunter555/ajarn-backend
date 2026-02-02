const Job = require("../../models/jobs");
const mongoose = require("mongoose");

const checkJobExpiration = async () => {
  const today = new Date();
  // if the value exceeds 20 days
  // from time posted until today
  // job should be deleted.
  const maxPostDuration = 20 * 24 * 60 * 60 * 1000;
  // i.e today - 20 days (ms)
  const breakPoint = today.getTime() - maxPostDuration;

  // find all jobs that are created before 20 days
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

/**
 * const Job = require("../../models/jobs");
const User = require("../../models/users");
const Recruitment = require("../../models/recruitment")
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
    let creator = [];
    job.forEach((job) => {
      const jobPosted = new Date(job.datePosted);
      //jobs created before 20 days will be less than breakpoint
      if (jobPosted.getTime() < breakPoint) {
        creator.push(job?.creator.toString())
        //remove the job
        const objectId = new mongoose.Types.ObjectId(job._id);
        removeJobsArr.push(objectId);
      }
    });
    //find the person who created the job
    //find who they sent recruitment offers to
    //if there job expired, remove the recruitment offers from the user(s).
    //remove applications as well

    const recruitments = await Recruitment.find({ _id: { $in: creator }});
    const teacherArr = [];
    const recruitmentIds = [];
    recruitments.forEach((recruit) => {
      teacherArr.push(recruit.teacherId);
      recruitmentIds.push(recruit._id)
    });

    await User.pull({ recruitmentSent: { $in: recruitmentIds }});
    await User.pull({ recruitmentRecieved: { $in: recruitmentIds }});


    if (removeJobsArr.length > 0) {
      await Job.deleteMany({ _id: { $in: removeJobsArr } });
    }
    console.log("Cron job completed.");
  } catch (err) {
    console.log("Cron job error in job check.");
  }
};

module.exports = checkJobExpiration;
 */
