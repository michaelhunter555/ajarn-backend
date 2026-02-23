const HttpError = require("../models/http-error");

module.exports = (getTargetUserId) => {
  return (req, res, next) => {
    const authUserId = req.userData?.userId;
    const targetUserId = getTargetUserId?.(req);

    if (!authUserId) {
      return next(new HttpError("Authentication Failed", 401));
    }

    if (!targetUserId) {
      return next(new HttpError("Forbidden - Missing user id for authorization", 403));
    }

    if (authUserId.toString() !== targetUserId.toString()) {
      return next(new HttpError("Forbidden - You are not authorized for this action", 403));
    }

    return next();
  };
};
