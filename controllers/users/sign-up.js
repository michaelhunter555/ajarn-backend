const dotenv = require("dotenv");
dotenv.config();
const HttpError = require("../../models/http-error");
const User = require("../../models/users");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../../middleware/nodemailer");
const { uploadToCloudinary } = require("../../lib/cloudinaryHelper");

//POST user sign-up
const signup = async (req, res, next) => {
  //make sure user inputs satisfy requirments
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        "Please check check that your inputs match requirements and try again. Passwords must be at least 7 characters long and contain 1 number",
        422
      )
    );
  }
  //we expect name, email and password
  const { name, email, password, userType } = req.body;

  //check if e-mail already exists
  let hasUser;
  //try email
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    //if issue with call, return next error
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  //if user does already exist, return next error
  if (hasUser) {
    const error = new HttpError(
      "A user already exists under the current e-mail.",
      422
    );
    return next(error);
  }

  let encryptPassword;

  try {
    encryptPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user please try again.", 500);
    return next(error);
  }

  //create a random token from crypto
  const verificationToken = crypto.randomBytes(32).toString("hex");

  let imageUrl = null;

  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Could not upload image, please try again.",
        500
      );
      return next(error);
    }
  }

  //create new instance of User object with required fields
  const createdUser = new User({
    name,
    email,
    image: imageUrl,
    password: encryptPassword,
    userType,
    isHidden: userType === "employer",
    verificationToken,
    isVerified: false,
    credits: 15, //temporary for new creators
  });

  //try to create user
  try {
    await createdUser.save();
  } catch (err) {
    //if issue with call, return next error
    const error = new HttpError("signing up failed, please try again", 500);
    return next(error);
  }

  // //email verification link we will send to user.
  // const verificationLink = `${process.env.CLIENT_PATH}/verify-email?token=${verificationToken}`;
  // //our email
  // const mailOptions = {
  //   from: process.env.EMAIL_USER, //EMAIL_USER
  //   to: email,
  //   subject: "AjarnJobs.com - Verifiy your email address",
  //   html: `<p>
  //   Click Here to verify: <a href=${verificationLink}>Here</a> to verify your email
  //   </p>`,
  // };
  // //send email with transporter helper
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //     const errors = new HttpError(
  //       "Error with sending email verification.",
  //       404
  //     );
  //     return next(errors);
  //   }
  //   console.log("Verification email sent: " + info.response);
  // });

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.SECRET_WEB_TOKEN,
      { expiresIn: "10h" }
    );
    //render json data of new user
    res.status(201).json({
      buffetIsActive: createdUser.buffetIsActive,
      userType: createdUser.userType,
      userId: createdUser._id,
      email: createdUser.email,
      theme: createdUser.theme,
      image: createdUser.image,
      token: token,
      name: createdUser.name,
    });
  } catch (err) {
    const error = new HttpError("signing up failed, please try again", 500);
    return next(error);
  }
};

module.exports = signup;
