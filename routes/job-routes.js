const express = require("express");
const router = express.Router();
const getAllJobs = require("../controllers/jobs/get-all-jobs");
const getJobById = require("../controllers/jobs/get-job-by-id");
const getJobsByUserId = require("../controllers/jobs/get-jobs-by-user-id");
const createJob = require("../controllers/jobs/create-job");
const updateJobById = require("../controllers/jobs/update-job");
const deleteJobById = require("../controllers/jobs/delete-job-by-id");

const { check } = require("express-validator");

const {
  thaiCities,
  fullTimeSalaries,
  partTimeSalaries,
  coreJobRequirements,
} = require("../dummy_data/ThaiData");

//Get all jobs
router.get("/", getAllJobs);

//GET job by userId
router.get("/user/:uid", getJobsByUserId);

//GET jobs by jobId
router.get("/:jid", getJobById);

//POST job
router.post(
  "/create-job/:uid",
  //job validation logic
  //salary, location, and requirement inputs must match pre-set Data lists in ../dummy_data/thaiCities
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 7 }),
    check("salary").custom((value) => {
      const allowedSalary = [...fullTimeSalaries, ...partTimeSalaries];
      return allowedSalary.includes(value);
    }),
    check("requirements").custom((value) => {
      return coreJobRequirements.includes(value);
    }),
    check("workPermit").custom((value) => {
      const allowedValue = [true, false];
      return allowedValue.includes(value);
    }),
    check("location").custom((value) => {
      return thaiCities.includes(value);
    }),
    check("hours").custom((value) => {
      const allowedHours = ["Full-time", "Part-time"];
      return allowedHours.includes(value);
    }),
    check("jobType").custom((value) => {
      const allowedJobType = ["basic", "featured", "flare"];
      return allowedJobType.includes(value);
    }),
  ],
  createJob
);

//update jobById
router.patch(
  "/:jid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 7 }),
    check("jobType").custom((value) => {
      const allowedJobType = ["basic", "featured", "flare"];
      return allowedJobType.includes(value);
    }),
  ],
  updateJobById
);

//delete jobById
router.delete("/:jid", deleteJobById);

module.exports = router;
