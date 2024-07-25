const Recruitment = require("../../models/recruitment");

//GET recruitment offered by Employers to view status
const getEmployerRecruits = async (req, res, next) => {
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;
  const userId = req.params.creatorId;

  try {
    const recruitmentOffers = await Recruitment.find({ creatorId: userId })
      .populate({
        path: "teacherId",
        Model: "Users",
        select: "_id name recruitmentReceived location nationality",
      })
      .sort({ datePosted: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalRecruitmentOffers = await Recruitment.countDocuments({
      creatorId: userId,
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

module.exports = getEmployerRecruits;
