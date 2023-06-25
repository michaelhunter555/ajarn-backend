const HttpError = require("../../models/http-error");
const Income = require("../../models/income");

const getIncomeDirectoryInfo = async (req, res, next) => {
  let incomeDirectoryData;

  try {
    incomeDirectoryData = await Income.find({}).populate({
      path: "userId",
      model: "Users",
      select:
        "_id postDate monthlySalary monthlySavings lifestyle perfectNumber jobTitle educationLevel",
    });
  } catch (err) {
    const error = new HttpError(
      "There was an error with the Get request.",
      500
    );
    return next(error);
  }

  const mostRecentPosts = incomeDirectoryData.sort(
    (a, b) => b.postDate - a.postDate
  );

  res.status(200).json({ incomeDirectoryData: mostRecentPosts, ok: true });
};

module.exports = getIncomeDirectoryInfo;
