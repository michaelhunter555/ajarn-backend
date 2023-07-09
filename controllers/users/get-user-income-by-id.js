const HttpError = require("../../models/http-error");
const Income = require("../../models/income");

const getUserIncomePostById = async (req, res, next) => {
  const incomePostId = req.params.id; //add get route :id

  let incomeData;

  try {
    incomeData = await Income.findById(incomePostId).populate({
      path: "userId",
      Model: "Users",
      select:
        " _id name nationality jobTitle lifestyle monthlySalary monthlySavings perfectNumber education postDate location",
    });
  } catch (err) {
    const error = new HttpError(
      "There was an issue retrieving the post data",
      500
    );
    return next(error);
  }

  res.status(200).json({ incomeDetails: incomeData });
};

module.exports = getUserIncomePostById;
