const HttpError = require("../../models/http-error");
const jwt = require("jsonwebtoken");

//POST generate temporary JWT token for Firebase-verified users
const generateTempToken = async (req, res, next) => {
  const { email, firebaseUid } = req.body;

  if (!email || !firebaseUid) {
    return next(new HttpError("Email and Firebase UID are required", 400));
  }

  try {
    // Generate a temporary JWT token for Firebase-verified users
    const tempToken = jwt.sign(
      {
        email: email,
        firebaseUid: firebaseUid,
        isTemporary: true
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "1h" }
    );

    // console.log("🎫 Generated temporary JWT token for Firebase user:", email);

    res.status(200).json({
      message: "Temporary token generated successfully",
      token: tempToken,
      email: email,
      firebaseUid: firebaseUid
    });
  } catch (err) {
    console.error("❌ Error generating temporary token:", err);
    const error = new HttpError("Failed to generate token", 500);
    return next(error);
  }
};

module.exports = generateTempToken;
