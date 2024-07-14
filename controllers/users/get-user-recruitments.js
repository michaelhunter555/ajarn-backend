const Recruitment = require("../../models/recruitment");

const getUserRecruitments = async (req, res, next) => {
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;
  const userId = req.params.userId;

  try {
    const recruitmentOffers = await Recruitment.find({ teacherId: userId })
      .sort({ datePosted: -1 })
      .skip(pageNum - 1)
      .limit(limitNum);

    const totalRecruitmentOffers = await Recruitment.countDocuments({
      teacherId: userId,
    });
    const totalPages = Math.ceil(totalRecruitmentOffers / limitNum);

    res.status(200).json({
      recruitmentOffers,
      pageNum,
      totalPages,
      totalRecruitmentOffers,
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Error retrieving recruitment offers " + err });
  }
};

module.exports = getUserRecruitments;
