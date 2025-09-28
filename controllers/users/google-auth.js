const HttpError = require("../../models/http-error");
const jwt = require("jsonwebtoken");
const User = require("../../models/users");

// Temporary Google sign-in handler (client-side verification; no server verification)
const googleAuth = async (req, res, next) => {
  try {
    const { email, name, picture, sub, googleId } = req.body || {};

    if (!email) {
      const error = new HttpError("No email provided", 400);
      return next(error);
    }

    let user = await User.findOne({ email }).populate("applications");

    if (!user) {
      user = new User({
        email,
        name: name || "",
        image: picture,
        userType: "teacher",
        isEmailVerified: true,
        password: null,
        googleId: googleId || sub || null,
        isOnboarded: false
      });
      await user.save();
    } else {
      let hasChanges = false;
      if (!user.image && picture) {
        user.image = picture;
        hasChanges = true;
      }
      const incomingGoogleId = googleId || sub || null;
      if (!user.googleId && incomingGoogleId) {
        user.googleId = incomingGoogleId;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );

    res.status(200).json({
      userId: user._id,
      email: user.email,
      userType: user.userType,
      image: user.image,
      buffetIsActive: user.buffetIsActive,
      token: token,
      coverLetter: user.coverLetter,
      resume: user.resume,
      pdfResume: user.pdfResume,
      incomeDirectory: user.incomeDirectory,
      applications: user.applications,
      jobs: user.jobs,
      blogPosts: user.blogPosts,
      buffetStartDate: user.buffetStartDate,
      buffetEndDate: user.buffetEndDate,
      theme: user.theme,
      name: user.name,
      isGoogleUser: true,
      needsOnboarding: !user.isOnboarded
    });
  } catch (error) {
    console.log("Google auth error:", error);
    const httpError = new HttpError("Google authentication failed", 401);
    return next(httpError);
  }
};

module.exports = {
  googleAuth
};