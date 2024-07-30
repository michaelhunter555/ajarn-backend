const Feedback = require("../../models/feedback");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");
//sanitize response

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
