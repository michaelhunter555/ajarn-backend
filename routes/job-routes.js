const express = require("express");
const router = express.Router();
const jobsControllers = require("../controllers/jobs-controllers");

//GET jobs by jobId
router.get("/:jid", jobsControllers.getJobById);

//GET job by userId
router.get("/user/:uid", jobsControllers.getJobsByUserId);

//POST job
router.post("/", jobsControllers.createJob);

//update jobById
router.patch("/:jid", jobsControllers.updateJobById);

//delete jobById
router.delete("/:jid", jobsControllers.deleteJobById);

module.exports = router;
