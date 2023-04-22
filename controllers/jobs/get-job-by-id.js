const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

//GET job by id => /api/jobs/${job.jid}
const getJobById = async (req, res, next) => {
  //get jobId
  const jobId = req.params.jid;

  //declare job variable
  let job;

  //try finding job by Id with await and try catch
  try {
    //await job FindById
    job = await Job.findById(jobId);
  } catch (err) {
    console.log(err);
    //create HttpError and store in variable
    const error = new HttpError(
      "There was an error retriving the provided job id.",
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
  res.json({ job: job.toObject({ getters: true }) });
};

module.exports = getJobById;
