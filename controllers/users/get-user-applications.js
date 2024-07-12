const Applications = require("../../models/application");

const getUserApplications = async (req, res) => {
  const userId = req.params.userId;
  const { page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  try {
    const applications = await Applications.find({ userId })
      .skip((pageNum - 1) * limit)
      .limit(limitNum)
      .populate({
        path: "jobId",
        model: "Jobs",
        select: "_id title location salary workPermit hours",
        populate: {
          path: "creator",
          model: "Creator",
          select: "_id company image",
        },
      });

    const totalApplications = await Applications.countDocuments({ userId });
    const totalPages = Math.ceil(totalApplications / limitNum);

    res
      .status(200)
      .json({ applications, totalPages, pageNum, totalApplications });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "There was an error with retrieving applications " + err,
    });
  }
};

module.exports = getUserApplications;
