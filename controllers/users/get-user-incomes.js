const HttpError = require("../../models/http-error");
const Income = require("../../models/income");

const getIncomeDirectoryInfo = async (req, res, next) => {
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  let incomeDirectoryData;

  try {
    incomeDirectoryData = await Income.find({})
      .populate({
        path: "userId",
        model: "Users",
        select: "_id location userType",
      })
      .sort({ postDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalIncomes = await Income.countDocuments({});
    const totalPages = Math.ceil(totalIncomes / limitNum);

    res.status(200).json({
      incomeDirectoryData,
      pageNum,
      totalPages,
      totalIncomes,
      ok: true,
    });
  } catch (err) {
    const error = new HttpError(
      "There was an error with the Get request.",
      500
    );
    return next(error);
  }
};

module.exports = getIncomeDirectoryInfo;
