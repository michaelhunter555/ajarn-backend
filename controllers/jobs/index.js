const getAllJobs = require("./get-all-jobs");
const getJobById = require("./get-job-by-id");
const getJobsByUserId = require("./get-jobs-by-user-id");
const createJob = require("./create-job");
const updateJobById = require("./update-job-by-id");
const deleteJobById = require("./delete-job-by-id");

module.exports = {
  ...getAllJobs,
  ...getJobById,
  ...getJobsByUserId,
  ...createJob,
  ...updateJobById,
  ...deleteJobById,
};
