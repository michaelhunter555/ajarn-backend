const Feedback = require("../../models/feedback");
const User = require("../../models/users");
const Job = require("../../models/jobs");
const HttpError = require("../../models/http-error");
const { handleAdminJobReportNotification } = require("../../lib/brevoHelper");
//sanitize response
/**
 * 
 *  user: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
  userName: { type: String, required: true },
  datePosted: { type: String, required: true, default: Date.now },
  feedback: { type: String, required: true },
  feedbackType: { type: String, required: true, default: "Employer Guide" },
  reportedJobId: { type: String, required: false, default: "" },
  reportedUserId: { type: String, required: false, default: "" },
 */

const reportJobViolation = async (req, res, next) => {
  const { jobViolation } = req.body;

  try {
    const user = await User.findById(jobViolation.user); //user who reported the job
    if (!user) {
      const error = new HttpError(
        "Could not find a user with the provided Id.",
        404
      );
      return next(error);
    }

    const newFeedbackViolation = new Feedback({
      ...jobViolation,
    });

    await newFeedbackViolation.save();

    const job = await Job.findById(jobViolation.reportedJobId).select("_id title description location salary type creator").lean();
    if (!job) {
      const error = new HttpError(
        "Could not find a job with the provided Id.",
        404
      );
      return next(error);
    }

    await handleAdminJobReportNotification(
      user.name, 
      user.email,
      job, 
      newFeedbackViolation.feedbackType, 
      newFeedbackViolation.feedback
    );

    res.status(201).json({
      message: "we've received your feedback and will look into this shortly",
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "There was an error in receiving your message:" + err,
      ok: false,
    });
  }
};

module.exports = reportJobViolation;
