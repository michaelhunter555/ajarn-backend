const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const Creator = require("../../models/creator");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../../lib/cloudinaryHelper");

//POST complete onboarding
const completeOnboarding = async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Please provide valid information", 422));
  }

  const userId = req.params.uid;
  const { 
    nationality, 
    location, 
    workExperience, 
    education, 
    university, 
    name, 
    email, 
    userType, 
    firebaseUid } = req.body;
    const employer = req.body;
    
    // Handle interests and skill fields that might be sent as arrays
    const interests = Array.isArray(req.body.interests) ? req.body.interests.join(', ') : (req.body.interests || '');
    const skill = Array.isArray(req.body.skill) ? req.body.skill.join(', ') : (req.body.skill || '');

    console.log("employer", employer);
    
    
  // Handle image upload
  let imageUrl = "";
  if (req.file) {
    try {
      // console.log("📸 Uploading image to Cloudinary...");
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = cloudinaryResult.secure_url;
      // console.log("✅ Image uploaded to Cloudinary:", imageUrl);
    } catch (err) {
      console.error("❌ Error uploading image to Cloudinary:", err);
      const error = new HttpError("Failed to upload image", 500);
      return next(error);
    }
  } else if (req.body.image && req.body.image !== "{}") {
    // If image is passed as URL string (not file)
    imageUrl = req.body.image;
  }

  // Debug logging
  // console.log('🏢 UserType received:', userType);

  // Get Firebase data from middleware (req.userData)
  let firebaseData = {};
  if (req.userData && req.userData.isTemporary) {
    firebaseData = {
      email: req.userData.email,
      firebaseUid: req.userData.firebaseUid
    };
    // console.log('Firebase data from middleware:', firebaseData);
  }

  let orConditions = [
    { email: email || firebaseData.email },
    { firebaseUid: firebaseUid || firebaseData.firebaseUid },
  ];

  if(firebaseData.firebaseUid !== userId) {
    // means they are oAuth user
    orConditions.push({ _id: userId });
  }

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ $or: orConditions });

    let newUser;
    if (existingUser) {
      // console.log('👤 User already exists, updating:', existingUser._id);
      // Update existing user with onboarding data
      existingUser.name = name || existingUser.name;
      existingUser.userType = userType || existingUser.userType;
      existingUser.image = imageUrl || existingUser.image;
      existingUser.nationality = nationality || existingUser.nationality;
      existingUser.location = location || existingUser.location;
      existingUser.workExperience = workExperience || existingUser.workExperience;
      existingUser.education = education || existingUser.education;
      existingUser.university = university || existingUser.university;
      existingUser.interests = interests || existingUser.interests;
      existingUser.skill = skill || existingUser.skill;
      existingUser.isOnboarded = true;
      existingUser.isVerified = true;
      existingUser.credits = userType === "employer" ? 15 : 0;

      const finalFirebaseUid = firebaseUid || firebaseData.firebaseUid || existingUser.firebaseUid;
      if (finalFirebaseUid && finalFirebaseUid !== 'undefined') {
        existingUser.firebaseUid = finalFirebaseUid;
      }
      
      newUser = await existingUser.save();
      // console.log('✅ Existing user updated:', newUser._id);
    } else {
      console.log('👤 Creating new user');
      // Create new user with all data
      newUser = new User({
        name: name || 'User',
        email: email || firebaseData.email,
        userType: userType || 'teacher',
        isHidden: userType === "employer",
        image: imageUrl ?? '',
        firebaseUid: firebaseUid || firebaseData.firebaseUid,
        nationality,
        location,
        workExperience,
        education,
        university,
        interests,
        skill,
        isOnboarded: true,
        isVerified: true,
        password: null,
        credits: userType === "employer" ? 15 : 0,
      });

      await newUser.save();
      // console.log('✅ New user created:', newUser._id);
    }

    if (userType === "employer") {
      const newCreator = new Creator({
        _id: newUser._id,
        company: employer.name,
        logoUrl: employer.logoUrl,
        companySize: employer.companySize,
        headquarters: employer.headquarters,
        established: employer.established,
        presence: employer.presence,
        about: employer.about,
        image: employer.image,
      });
      await newCreator.save();
      newUser.creator = newCreator._id;
      await newUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
      },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );

    // Return user data and token
    res.status(201).json({
      message: "User created and onboarding completed successfully",
      userId: newUser._id,
      email: newUser.email,
      userType: newUser.userType,
      image: newUser.image,
      name: newUser.name,
      nationality: newUser.nationality,
      location: newUser.location,
      workExperience: newUser.workExperience,
      education: newUser.education,
      university: newUser.university,
      isOnboarded: newUser.isOnboarded,
      token: token,
      buffetIsActive: newUser.buffetIsActive,
      blogPosts: newUser.blogPosts,
      resume: newUser.resume,
      coverLetter: newUser.coverLetter,
      incomeDirectory: newUser.incomeDirectory,
      applications: newUser.applications,
      jobs: newUser.jobs,
      buffetStartDate: newUser.buffetStartDate,
      buffetEndDate: newUser.buffetEndDate,
      theme: newUser.theme,
      needsOnboarding: false,
      credits: 15
    });
  } catch (err) {
    console.log("User creation error:", err);
    const error = new HttpError("Failed to create user", 500);
    return next(error);
  }
};

module.exports = completeOnboarding;
