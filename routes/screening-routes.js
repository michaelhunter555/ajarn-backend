const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/auth");
const createScreening = require("../controllers/screenings/create-screening");
const updateScreening = require("../controllers/screenings/update-screening");
const deleteScreening = require("../controllers/screenings/delete-screening");
const sendoutScreening = require("../controllers/screenings/sendout-screening");
const aiAnalyzeScreening = require("../controllers/screenings/ai-analyze-screening");
const updateScreeningResults = require("../controllers/screenings/update-screening-results");

const router = express.Router();

router.use(checkAuth);

router.post(
  "/create-screening",
  [
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
    check("jobId").not().isEmpty(),
    check("date").not().isEmpty(),
    check("maxTimeAllowed").isNumeric(),
  ],
  createScreening
);

router.patch("/:sid", updateScreening);
router.delete("/:sid", deleteScreening);
router.post("/:sid/sendout", sendoutScreening);
router.post("/:sid/ai-analyze", aiAnalyzeScreening);
router.patch("/results/:rid/answer", updateScreeningResults);

module.exports = router;
