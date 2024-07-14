const Recruitment = require("../../models/recruitment");
const User = require("../../models/users");

const recruitmentResponse = async (req, res, next) => {
  const userId = req.params.userId;
  const { recruitmentResponse, jobId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const recruitOffer = await Recruitment.findOne({ jobId });
    if (!recruitOffer) {
      return res.status(404).json({ message: "Recruitment offer not found" });
    }

    if (recruitmentResponse.declineReason) {
      recruitOffer.declineReason = recruitmentResponse.declineReason;
    }
    recruitOffer.repsonse = recruitmentResponse.response;

    await recruitOffer.save();
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        message: "Failed to update recruitment response for user: " + err,
      });
  }
};

module.exports = recruitmentResponse;
