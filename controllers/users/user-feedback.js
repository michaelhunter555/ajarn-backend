const User = require("../../models/users");
const Feedback = require("../../models/feedback");

const postUserFeedback = async (req, res, next) => {
  const userId = req.params.userId;
  const { feedback } = req.body;

  try {
    const user = await User.findById(userId);
    const newFeedback = new Feedback({
      user: user._id,
      userName: user.name,
      datePosted: new Date(),
      feedback: feedback.feedback,
      feedbackType: feedback.feedbackType,
    });

    await newFeedback.save();
    res
      .status(201)
      .json({ message: "feedback received successfully.", ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "error receiving feedback", ok: false });
  }
};

module.exports = postUserFeedback;
