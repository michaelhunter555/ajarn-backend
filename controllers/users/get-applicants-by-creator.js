const Applications = require("../../models/application");
const Jobs = require("../../models/jobs");

const getApplicantsByCreator = async (req, res, next) => {
  const creatorId = req.params.creatorId;
  const { page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  try {
    // Step 1: Fetch job IDs for the given creator
    const jobIds = await Jobs.find({ creator: creatorId }).select("_id").lean();
    const jobIdArray = jobIds.map((job) => job._id);

    // Step 2: Fetch applicants with pagination
    const applications = await Applications.find({ jobId: { $in: jobIdArray } })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({
        path: "userId",
        model: "Users",
        select: "_id name email location nationality",
      })
      .lean();

    // Step 3: Calculate total applicants and total pages
    const totalApplicants = await Applications.countDocuments({
      jobId: { $in: jobIdArray },
    });
    const totalPages = Math.ceil(totalApplicants / limitNum);

    res.status(200).json({
      jobApplications: applications,
      totalApplicants,
      totalPages,
      page: pageNum,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message:
        "There was an error with the request to get applicants by creator.",
    });
  }
};

module.exports = getApplicantsByCreator;
