const dotenv = require("dotenv");
dotenv.config();
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new Error("Authentication failed");
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_WEB_TOKEN);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    console.log("MIDDLEWARE ERROR:", err);
    const error = new HttpError("Authentication Failed", 401);
    return next(error);
  }
};
