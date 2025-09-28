const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//POST user login
const login = async (req, res, next) => {
  console.log("🔐 Login endpoint hit");
  console.log("📝 Request body:", req.body);
  
  //make sure the user actually enters something
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation errors:", errors);
    throw new HttpError("please enter a valid email and password");
  }

  //check if user exists
  const { email, password, firebaseUid } = req.body;

  //declare variable
  let identifiedUser;

  try {
    console.log("🔍 Looking for user with email:", email);
    //try to find the user by email
    identifiedUser = await User.findOne({ email: email }).populate(
      "applications"
    );
    console.log("👤 User found:", !!identifiedUser);
  } catch (err) {
    console.error("❌ Error finding user:", err);
    const error = new HttpError(
      "there was an error with the login request",
      500
    );
    return next(error);
  }

  //if user data does not exist, but Firebase verified them, they need to complete signup
  if (!identifiedUser) {
    console.log("❌ No user found with email:", email);
    console.log("🔥 Firebase verified user but not in MongoDB - needs to complete signup");
    
    // Generate a temporary JWT token for Firebase-verified users
    let tempToken;
    try {
      tempToken = jwt.sign(
        {
          email: email,
          firebaseUid: firebaseUid,
          isTemporary: true
        },
        process.env.SECRET_WEB_TOKEN,
        { expiresIn: "1h" }
      );
      console.log("🎫 Generated temporary JWT token for Firebase user");
    } catch (err) {
      console.error("❌ Error generating temporary token:", err);
      const error = new HttpError("Signup completion failed, please try again", 500);
      return next(error);
    }
    
    // Return special response for Firebase-verified users who haven't completed signup
    return res.status(200).json({ 
      message: "Please complete your signup process",
      needsSignupCompletion: true,
      firebaseUid: firebaseUid,
      email: email,
      token: tempToken
    });
  }

  // Handle Firebase Auth login (no password check needed)
  if (firebaseUid) {
    console.log("🔥 Firebase login attempt");
    console.log("🔍 Comparing Firebase UIDs - DB:", identifiedUser.firebaseUid, "Request:", firebaseUid);
    // Verify Firebase UID matches
    if (identifiedUser.firebaseUid !== firebaseUid) {
      console.log("❌ Firebase UID mismatch");
      const error = new HttpError("Firebase authentication failed.", 401);
      return next(error);
    }
    console.log("✅ Firebase UID matches");
  } else if (password) {
    console.log("🔐 Traditional password login attempt");
    // Handle traditional password login
    let isValidPass = false;

    try {
      isValidPass = await bcrypt.compare(password, identifiedUser.password);
      console.log("🔍 Password valid:", isValidPass);
    } catch (err) {
      console.error("❌ Error comparing password:", err);
      const error = new HttpError(
        "there was an issue with logging you in. Check your email or password.",
        500
      );
      return next(error);
    }

    if (!isValidPass) {
      console.log("❌ Invalid password");
      const error = new HttpError("Incorrect Password, please try again.", 401);
      return next(error);
    }
  } else {
    console.log("❌ No authentication method provided");
    // Neither firebaseUid nor password provided
    const error = new HttpError("Authentication method required.", 400);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: identifiedUser._id,
        email: identifiedUser.email,
        userType: identifiedUser.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );
  } catch (err) {
    const error = new HttpError("login failed, please try again", 500);
    return next(error);
  }

  //gg
  //return user object on success
  res.status(200).json({
    userId: identifiedUser._id,
    email: identifiedUser.email,
    userType: identifiedUser.userType,
    image: identifiedUser.image,
    buffetIsActive: identifiedUser.buffetIsActive,
    token: token,
    coverLetter: identifiedUser.coverLetter,
    resume: identifiedUser.resume,
    pdfResume: identifiedUser.pdfResume,
    incomeDirectory: identifiedUser.incomeDirectory,
    applications: identifiedUser.applications,
    jobs: identifiedUser.jobs,
    blogPosts: identifiedUser.blogPosts,
    buffetStartDate: identifiedUser.buffetStartDate,
    buffetEndDate: identifiedUser.buffetEndDate,
    theme: identifiedUser.theme,
    name: identifiedUser.name,
    needsOnboarding: !identifiedUser.isOnboarded // Flag for frontend
  });
};

module.exports = login;
