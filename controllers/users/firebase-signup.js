const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");

//POST Firebase user signup (after email verification)
const firebaseSignup = async (req, res, next) => {
  console.log("🔥 Firebase signup endpoint hit");
  console.log("📝 Request body:", req.body);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation errors:", errors);
    return next(new HttpError("Please provide valid information", 422));
  }

  const { firebaseUid, email, name, userType, image } = req.body;

  // Check if user already exists
  let existingUser;
  try {
    console.log("🔍 Checking for existing user with email:", email, "or firebaseUid:", firebaseUid);
    existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { firebaseUid: firebaseUid }
      ]
    });
    console.log("👤 Existing user found:", !!existingUser);
  } catch (err) {
    console.error("❌ Error finding existing user:", err);
    const error = new HttpError("Signup failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    console.log("⚠️ User already exists");
    const error = new HttpError("User already exists", 422);
    return next(error);
  }

  // Create new user
  console.log("👤 Creating new user in database...");
  const createdUser = new User({
    name,
    email,
    userType,
    image: image || "",
    firebaseUid,
    isEmailVerified: true, // Firebase handles email verification
    password: null, // No password for Firebase users
    isOnboarded: false // New users need onboarding
  });

  try {
    await createdUser.save();
    console.log("✅ User saved to database with ID:", createdUser._id);
  } catch (err) {
    console.error("❌ Error saving user:", err);
    const error = new HttpError("Signup failed, please try again", 500);
    return next(error);
  }

  // Generate JWT token
  let token;
  try {
    console.log("🎫 Generating JWT token...");
    const jwt = require("jsonwebtoken");
    token = jwt.sign(
      {
        userId: createdUser._id,
        email: createdUser.email,
        userType: createdUser.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );
    console.log("✅ JWT token generated");
  } catch (err) {
    console.error("❌ Error generating token:", err);
    const error = new HttpError("Signup failed, please try again", 500);
    return next(error);
  }

  console.log("📤 Sending success response");
  res.status(201).json({
    message: "User created successfully. Please verify your email.",
    userId: createdUser._id,
    email: createdUser.email,
    userType: createdUser.userType,
    image: createdUser.image,
    token: token,
    buffetIsActive: createdUser.buffetIsActive,
    blogPosts: createdUser.blogPosts,
    resume: createdUser.resume,
    coverLetter: createdUser.coverLetter,
    incomeDirectory: createdUser.incomeDirectory,
    applications: createdUser.applications,
    jobs: createdUser.jobs,
    buffetStartDate: createdUser.buffetStartDate,
    buffetEndDate: createdUser.buffetEndDate,
    theme: createdUser.theme,
    name: createdUser.name,
    needsOnboarding: !createdUser.isOnboarded
  });
};

module.exports = firebaseSignup;
