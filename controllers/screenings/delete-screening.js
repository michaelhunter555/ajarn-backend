const mongoose = require("mongoose");
const HttpError = require("../../models/http-error");
const Screening = require("../../models/screenings");
const ScreeningQuestion = require("../../models/screening-questions");
const Job = require("../../models/jobs");

const deleteScreening = async (req, res, next) => {
  const screeningId = req.params.sid;

  let screening;
  try {
    screening = await Screening.findById(screeningId);
  } catch (err) {
    return next(new HttpError("There was an error finding screening by id.", 500));
  }

  if (!screening) {
    return next(new HttpError("Screening not found.", 404));
  }

  let job;
  try {
    job = await Job.findById(screening.jobId).select("creator");
  } catch (err) {
    return next(new HttpError("There was an error checking screening ownership.", 500));
  }

  if (!job || job.creator.toString() !== req.userData?.userId?.toString()) {
    return next(new HttpError("Forbidden - You are not authorized for this action", 403));
  }

  let sess;
  try {
    sess = await mongoose.startSession();
    sess.startTransaction();

    const questionIds = Array.isArray(screening.questions) ? screening.questions : [];
    await screening.deleteOne({ _id: screeningId }, { session: sess });

    if (questionIds.length > 0) {
      await ScreeningQuestion.deleteMany({ _id: { $in: questionIds } }, { session: sess });
    }

    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    if (sess) {
      await sess.abortTransaction();
    }
    return next(new HttpError("Deleting screening failed, please try again.", 500));
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  return res.status(200).json({ ok: true, message: "Screening deleted." });
};

module.exports = deleteScreening;
