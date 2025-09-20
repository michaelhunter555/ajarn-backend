const dotenv = require("dotenv");
dotenv.config();
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  // console.log("Checked auth token");
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Token received:", token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    if (!token) {
      console.log("❌ No token provided");
      throw new Error("Authentication failed");
    }
    
    if (!token.startsWith('eyJ')) {
      console.log("❌ Invalid token format:", token);
      throw new Error("Invalid token format");
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_WEB_TOKEN);
    
    // Handle temporary tokens for Firebase-verified users
    if (decodedToken.isTemporary) {
      req.userData = { 
        email: decodedToken.email,
        firebaseUid: decodedToken.firebaseUid,
        isTemporary: true
      };
    } else {
      req.userData = { userId: decodedToken.userId };
    }
    
    //console.log("Authenticated token check passed!");
    next();
  } catch (err) {
    console.log("MIDDLEWARE ERROR:", err);
    const error = new HttpError("Authentication Failed", 401);
    return next(error);
  }
};
