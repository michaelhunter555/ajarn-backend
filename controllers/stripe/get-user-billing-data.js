const UserBilling = require("../../models/billing");
const HttpError = require("../../models/http-error");

const getUserBillingData = async (req, res, next) => {
  const userId = req.params.userId;
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 5;

  if (!userId) {
    const error = new HttpError("no userId found", 404);
    return next(error);
  }

  try {
    const userBilling = await UserBilling.find({ userId })
      .sort({ purchaseDate: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalBillingItems = await UserBilling.countDocuments({ userId });
    const totalPages = Math.ceil(totalBillingItems / limitNum);

    res
      .status(200)
      .json({ userBilling, totalPages, pageNum, totalBillingItems });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving user data: " + err });
  }
};

module.exports = getUserBillingData;
