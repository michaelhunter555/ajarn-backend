const HttpError = require("../../models/http-error");
const jwt = require("jsonwebtoken");
const User = require("../../models/users");
const { OAuth2Client } = require('google-auth-library');

// Google OAuth JWT verification handler
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      const error = new HttpError("No Google credential provided", 400);
      return next(error);
    }

    // Verify the Google JWT
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Debug logging
    console.log('Google OAuth payload:', { email, name, picture });
    
    // Check if user exists in database
    let user = await User.findOne({ email }).populate("applications");
    
    if (!user) {
      // Create new user (needs onboarding)
      user = new User({
        email,
        name,
        image: picture,
        userType: 'teacher', // Default user type
        isEmailVerified: true, // Google emails are pre-verified
        password: null, // No password for OAuth users
        googleId: payload.sub, // Store Google ID
        isOnboarded: false // New users need onboarding
      });
      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (!user.image && picture) {
        user.image = picture;
      }
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );

    // Return user data and token (same format as regular login)
    res.status(200).json({
      userId: user._id,
      email: user.email,
      userType: user.userType,
      image: user.image,
      buffetIsActive: user.buffetIsActive,
      token: token,
      coverLetter: user.coverLetter,
      resume: user.resume,
      incomeDirectory: user.incomeDirectory,
      applications: user.applications,
      jobs: user.jobs,
      blogPosts: user.blogPosts,
      buffetStartDate: user.buffetStartDate,
      buffetEndDate: user.buffetEndDate,
      theme: user.theme,
      name: user.name,
      isGoogleUser: true,
      needsOnboarding: !user.isOnboarded // Flag for frontend
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
