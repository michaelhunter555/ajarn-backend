const Jobs = require("../../models/jobs");

const getJobListings = async (req, res) => {
  const creatorId = req.params.creatorId;
  const { page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  try {
    const creatorJobs = await Jobs.find({ creator: creatorId })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalJobs = await Jobs.countDocuments({ creator: creatorId });
    const totalPages = Math.ceil(totalJobs / limitNum);
    res.status(200).json({ jobs: creatorJobs, pageNum, totalPages, ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

module.exports = getJobListings;
