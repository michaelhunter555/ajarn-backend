const express = require("express");
const router = express.Router();
const jobsControllers = require("../controllers/jobs-controllers");

//GET jobs by jobId
router.get("/:jid", jobsControllers.getJobById);

//GET job by userId
router.get("/user/:uid", jobsControllers.getJobByUserId);

//POST job
router.post("/", jobsControllers.createJob);

module.exports = router;
