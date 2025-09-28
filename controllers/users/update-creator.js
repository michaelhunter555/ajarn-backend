const HttpError = require("../../models/http-error");
const Creator = require("../../models/creator");
const User = require("../../models/users");
const { validationResult } = require("express-validator");
const { uploadToCloudinary } = require("../../lib/cloudinaryHelper");

const updateCreator = async (req, res, next) => {
  const userId = req.params.uid;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(
      "VALIDATION RESULT ERROR: Please make sure all fields are valid before making changes"
    );
    throw new HttpError(
      "Please make sure all fields are valid before making changes",
      422
    );
  }

  const { 
    creator, 
    isRegistration,
    company,
    logoUrl,
    companySize,
    headquarters,
    established,
    presence,
    about
  } = req.body;

  // Handle image upload
  let imageUrl = "";
  if (req.file) {
    try {
      console.log("📸 Uploading image to Cloudinary...");
      imageUrl = await uploadToCloudinary(req.file.buffer);
      //console.log("✅ Image uploaded successfully:", imageUrl);
    } catch (err) {
      console.error("❌ Image upload error:", err);
      const error = new HttpError("Failed to upload image", 500);
      return next(error);
    }
  }

  let user;
  try {
    user = await User.findById(userId).populate("creator");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "There was an error associating the user e-mail with this account",
      500
    );
    return next(error);
  }

  // Update user image if uploaded

  if(isRegistration === 'true') {
    user.needsOnboarding = false;
    user.userType = "employer";
    user.isHidden = true;
    user.credits = 15;
    user.isOnboarded = true;
    await user.save()
  }

  if (imageUrl) {
    user.image = imageUrl.secure_url;
    await user.save();
  }

  const hasCreatorAccount = user && user.creator !== null;

  //console.log("isRegistration", isRegistration)

  if (!hasCreatorAccount || isRegistration === 'true') {
    try {
      const newCreator = new Creator({
        _id: user._id,
        company: isRegistration ? company : (creator?.company || ''),
        logoUrl: isRegistration ? logoUrl : (creator?.logoUrl || ''),
        image: imageUrl.secure_url,
        companySize: isRegistration ? companySize : (creator?.companySize || ''),
        headquarters: isRegistration ? headquarters : (creator?.headquarters || ''),
        established: isRegistration ? established : (creator?.established || ''),
        presence: isRegistration ? presence : (creator?.presence || ''),
        about: isRegistration ? about : (creator?.about || ''),
      });
      await newCreator.save();
      user.creator = newCreator;
      await user.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Error with creating a new creator account",
        500
      );
      return next(error);
    }
  } else if (hasCreatorAccount && user.creator._id.toString() === userId) {
    try {
      user.creator.company = creator.company;
      user.creator.logoUrl = creator.logoUrl;
      user.creator.companySize = creator.companySize;
      user.creator.headquarters = creator.headquarters;
      user.creator.established = creator.established;
      user.creator.presence = creator.presence;
      user.creator.about = creator.about;
      await user.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Error with finding an existing creator account to associate with userId",
        500
      );
      return next(error);
    }
  }

  //console.log("success", user)

  res.status(200).json({ ok: true, user: user });
};

module.exports = updateCreator;
