const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");
const getAllJobs = require("../controllers/jobs/get-all-jobs");
const getJobById = require("../controllers/jobs/get-job-by-id");
const getJobsByUserId = require("../controllers/jobs/get-jobs-by-user-id");
const createJob = require("../controllers/jobs/create-job");
const updateJobById = require("../controllers/jobs/update-job");
const deleteJobById = require("../controllers/jobs/delete-job-by-id");
const activateBuffet = require("../controllers/jobs/activate-teacher-buffet");
const getJobsByCreatorId = require("../controllers/jobs/get-jobs-by-creator-id");
const getJobListings = require("../controllers/jobs/get-job-listings");
const getFeaturedJobs = require("../controllers/jobs/get-featured-jobs");
const recruitTeacher = require("../controllers/jobs/recruit-teacher");
const bulkDeleteJobsById = require("../controllers/jobs/bulk-delete-jobs-by-id");
const reportJobViolation = require("../controllers/jobs/report-job-violation");
const { check } = require("express-validator");

const {
  thaiCities,
  fullTimeSalaries,
  partTimeSalaries,
  coreJobRequirements,
} = require("../dummy_data/ThaiData");

//Get all jobs
router.get("/", getAllJobs);
//GET featured Jobs
router.get("/featured-jobs", getFeaturedJobs);
//GetJobListings
router.get("/job-listings/:creatorId", getJobListings);
//GET jobs by creatorId
router.get("/creator/:creatorId", getJobsByCreatorId);
//GET job by userId
router.get("/user/:uid", getJobsByUserId);

//GET jobs by jobId
router.get("/:jid", getJobById);

//middleware to check for invalid token request
router.use(checkAuth);

//POST job

router.post("/recruit-teacher", recruitTeacher);
router.post("/job-post-violation", reportJobViolation);
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
      const items = String(value)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (items.length < 1 || items.length > 2) {
        return false;
      }

      return items.every((req) => coreJobRequirements.includes(req));
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
  [check("title").not().isEmpty(), check("description").isLength({ min: 7 })],
  updateJobById
);

//activate teacher buffet
router.patch("/activate-buffet/:uid", activateBuffet);

router.delete("/bulk-job-delete", bulkDeleteJobsById);
//delete jobById
router.delete("/delete-job/:jid", deleteJobById);

module.exports = router;
