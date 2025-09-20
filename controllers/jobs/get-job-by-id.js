const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

//GET job by id => /api/jobs/${job.jid}
const getJobById = async (req, res, next) => {
  //get jobId
  const jobId = req.params.jid;

  //declare job variable
  let job;
  let otherJobs = [];

  //try finding job by Id
  try {
    //await job FindById and populate fields we'll need in our request.
    /*add if check to see if user is creator, if not, remove populated fields */
    job = await Job.findById(jobId)
      .populate("creator")
      .populate({
        path: "applicants",
        model: "Application",
        populate: {
          path: "userId",
          model: "Users",
          select: "name email resume",
        },
      });

    // Only fetch other jobs if the main job exists
    if (job && job.creator) {
      // Fetch other jobs from the same creator, excluding the current job
      // Don't populate applicants for other jobs to improve performance
      otherJobs = await Job.find({ 
        creator: job.creator._id,
        _id: { $ne: jobId } // Exclude current job
      })
      .populate("creator", "company logoUrl") // Only populate basic creator info
      .select("-applicants") // Exclude applicants to improve performance
      .limit(5) // Limit to 5 other jobs to avoid overwhelming the response
      .sort({ datePosted: -1 }); // Show most recent jobs first
    }

    if (job) {
      job.views = job.views += 1;
      await job.save();
    }
  } catch (err) {
    console.log(err);
    // if error with request, return next error
    const error = new HttpError(
      "There was an error retriving the provided job by id.",
      500
    );
    //return error if there are general problems with our GET request
    return next(error);
  }

  //If the GET request is fine, but we don't have said job id in our database then return error.
  if (!job) {
    const error = new HttpError(
      "Could not find a job for the provided job id.",
      404
    );
    return next(error);
  }

  //res job object
  res.json({ 
    job: job.toObject({ getters: true }), 
    otherJobs: otherJobs.map(job => job.toObject({ getters: true })),
    otherJobsCount: otherJobs.length,
    ok: true 
  });
};

module.exports = getJobById;
