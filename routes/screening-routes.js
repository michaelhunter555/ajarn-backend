const express = require("express");
const { check } = require("express-validator");
const checkAuth = require("../middleware/auth");
const requireSelf = require("../middleware/require-self");
const createScreening = require("../controllers/screenings/create-screening");
const updateScreening = require("../controllers/screenings/update-screening");
const deleteScreening = require("../controllers/screenings/delete-screening");
const sendoutScreening = require("../controllers/screenings/sendout-screening");
const aiAnalyzeScreening = require("../controllers/screenings/ai-analyze-screening");
const updateScreeningResults = require("../controllers/screenings/update-screening-results");
const getScreenings = require("../controllers/screenings/get-screenings");

const router = express.Router();

router.use(checkAuth);

router.get("/get-screenings/:userId", requireSelf((req) => req.params.userId), getScreenings);

router.post(
  "/create-screening/:userId",
  requireSelf((req) => req.params.userId),
  [
    check("title").not().isEmpty(),
    check("description").not().isEmpty(),
    check("jobId").not().isEmpty(),
    check("date").not().isEmpty(),
    check("maxTimeAllowed").isNumeric(),
  ],
  createScreening
);

router.patch("/update-screening/:sid/:userId", requireSelf((req) => req.params.userId), updateScreening);
router.delete("/delete-screening/:sid/:userId", requireSelf((req) => req.params.userId), deleteScreening);
router.post("/sendout-screening/:sid/:userId", requireSelf((req) => req.params.userId), sendoutScreening);
router.post("/ai-analyze-screening/:sid/:userId", requireSelf((req) => req.params.userId), aiAnalyzeScreening);
router.patch("/update-screening-results/:sid/:userId", requireSelf((req) => req.params.userId), updateScreeningResults);

module.exports = router;
