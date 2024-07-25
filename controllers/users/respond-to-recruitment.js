const Recruitment = require("../../models/recruitment");
const User = require("../../models/users");

const recruitmentResponse = async (req, res, next) => {
  const userId = req.params.userId;
  const { recruitmentResponse, recruitmentId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //maybe job id is not enough
    const recruitOffer = await Recruitment.findById(recruitmentId);
    if (!recruitOffer) {
      return res.status(404).json({ message: "Recruitment offer not found" });
    }

    if (recruitmentResponse.declineReason) {
      recruitOffer.declineReason = recruitmentResponse.declineReason;
    }
    recruitOffer.response = recruitmentResponse;

    await recruitOffer.save();
    res
      .status(200)
      .json({ message: "Updated recruitment status successful", ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to update recruitment response for user: " + err,
    });
  }
};

module.exports = recruitmentResponse;
