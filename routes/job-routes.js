const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs-controllers");
const { check } = require("express-validator");

let {
  thaiCities,
  fullTimeSalaries,
  partTimeSalaries,
  coreJobRequirements,
} = require("../dummy_data/ThaiData");

//Get all jobs
router.get("/", jobsController.getAllJobs);

//GET jobs by jobId
router.get("/:jid", jobsController.getJobById);

//GET job by userId
router.get("/user/:uid", jobsController.getJobsByUserId);

//POST job
router.post(
  "/",
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
  jobsController.createJob
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
  jobsController.updateJobById
);

//delete jobById
router.delete("/:jid", jobsController.deleteJobById);

module.exports = router;
