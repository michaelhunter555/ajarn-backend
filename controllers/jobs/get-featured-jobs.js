const Jobs = require("../../models/jobs");

const getFeaturedJobs = async (req, res, next) => {
  const { isHome, page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  let jobs;
  try {
    const featureJobsQuery = Jobs.find({ jobType: "featured" })
      .populate({
        path: "creator",
        //specify fields to be populated
        select:
          "_id company logoUrl companySize headquarters established presence image about",
      })
      .populate({
        path: "applicants",
        select: "applicationDate userId",
      });

    if (isHome === "true") {
      featureJobsQuery.skip(pageNum - 1).limit(limitNum);
    }
    jobs = await featureJobsQuery.exec();
    const totalJobs = await Jobs.countDocuments({ jobType: "featured" });
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.status(200).json({ jobs, pageNum, totalPages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error retrieving featured jobs" });
  }
};

module.exports = getFeaturedJobs;
