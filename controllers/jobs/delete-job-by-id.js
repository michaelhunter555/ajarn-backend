const HttpError = require("../../models/http-error");
const Job = require("../../models/jobs");

//DELETE delete job by Id
const deleteJobById = async (req, res, next) => {
  //request params for /:jid
  const jobId = req.params.jid;

  //declare job to delete variable
  let jobToDelete;
  //find job by id and delete
  try {
    jobToDelete = await Job.findByIdAndDelete(jobId);
  } catch (err) {
    //if bad request, return next error
    const error = new HttpError("There was an error with the request", 500);
    return next(error);
  }

  //if null, no job was found for that id
  if (!jobToDelete) {
    throw new HttpError("Could not find a place for that id", 404);
  }
  //confirm job is deleted message
  res.status(200).json({ message: "deleted a job" });
};

module.exports = deleteJobById;
