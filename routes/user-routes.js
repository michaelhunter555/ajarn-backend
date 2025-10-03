const express = require("express");
const checkAuth = require("../middleware/auth");
const router = express.Router();
const getUsers = require("../controllers/users/get-users");
const getVisibleUsers = require("../controllers/users/get-visible-users");
const updateVisibility = require("../controllers/users/update-visibility");
const getUserById = require("../controllers/users/get-user-by-id");
const signup = require("../controllers/users/sign-up");
const login = require("../controllers/users/login");
const updateUserProfile = require("../controllers/users/update-user-profile");
const addCredits = require("../controllers/users/add-credits");
const applyToJobById = require("../controllers/users/apply-to-job");
const updateUserRole = require("../controllers/users/update-user-role");
const updateCreator = require("../controllers/users/update-creator");
const fileUpload = require("../middleware/file-upload");
const IncomeDirectoryContribution = require("../controllers/users/add-income-directory");
const getIncomeDirectoryInfo = require("../controllers/users/get-user-incomes");
const getUserIncomePostById = require("../controllers/users/get-user-income-by-id");
const getApplicantsByCreator = require("../controllers/users/get-applicants-by-creator");
const verifyUserEmail = require("../controllers/users/verify-user-email");
const { googleAuth } = require("../controllers/users/google-auth");
const completeOnboarding = require("../controllers/users/complete-onboarding");
const firebaseSignup = require("../controllers/users/firebase-signup");
const generateTempToken = require("../controllers/users/generate-temp-token");
const getUserApplications = require("../controllers/users/get-user-applications");
const recruitmentResponse = require("../controllers/users/respond-to-recruitment");
const getUserRecruitments = require("../controllers/users/get-user-recruitments");
const getEmployerRecruits = require("../controllers/users/get-employer-recruitments");
const removeApplicantsById = require("../controllers/users/remove-applicants-by-id");
const removeRecruitById = require("../controllers/users/remove-recruits-by-id");
const removeApplicationFromJob = require("../controllers/users/remove-application-from-job");
const toggleUserTheme = require("../controllers/users/toggle-theme");
const postUserFeedback = require("../controllers/users/user-feedback");
const deleteUserById = require("../controllers/users/delete-user-by-id");
const deletePdfResume = require("../controllers/users/delete-pdfResume");
const supportEmail = require("../controllers/users/support-email");
const { check } = require("express-validator");

//const checkAuth = require("../middleware/auth");
//const { thaiCities } = require("../dummy_data/ThaiData");

/* GET ROUTES */

//GET all users
router.get("/", getUsers);

//GET all visible users
router.get("/visible-users", getVisibleUsers);

//GET user income contribution posts
router.get("/income-posts", getIncomeDirectoryInfo);

router.get("/income-posts/:id", getUserIncomePostById);

//GET verify user email address
router.get("/verify-email", verifyUserEmail); // should be a post?

//GET find user by id
router.get("/:uid", getUserById);

/* OPEN POST ROUTES */

//POST sign-up post
router.post(
  "/sign-up",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    //password must be at least 7 characters and contain a number
    check("password").isLength({ min: 7 }).matches(/\d/),
  ],
  signup
);

//POST login
router.post(
  "/login",
  [check("email").isEmail()],
  login
);

//POST Google OAuth
router.post("/google-auth", googleAuth);

//POST Firebase Signup (after email verification)
router.post("/firebase-signup", firebaseSignup);

//POST Generate temporary JWT token for Firebase-verified users
router.post("/generate-temp-token", generateTempToken);

//***check Authentication***
router.use(checkAuth);

//POST complete onboarding (protected route)
router.post("/complete-onboarding/:uid", fileUpload.single("image"), completeOnboarding);

//GET user applications
router.get("/get-applications/:userId", getUserApplications);

//GET Employer Recruits
router.get("/get-employer-recruits/:creatorId", getEmployerRecruits);
//GET applicants by creatorId
router.get("/applicants/:creatorId", getApplicantsByCreator);

//GET user recruitment Offers (if any)
router.get("/get-recruitment-offers/:userId", getUserRecruitments);

/* CLOSED POST ROUTE */

router.post("/user-feedback/:userId", postUserFeedback);
router.post("/toggle-theme/:userId", toggleUserTheme);
router.post("/support-email", supportEmail);
//POST
router.post("/recruitment-offer-response/:userId", recruitmentResponse);
//POST
router.post("/income-directory/:uid", IncomeDirectoryContribution);

//POST applyToJob
router.post("/:uid/apply/:jid", applyToJobById);

/* PATCH ROUTES */

//PATCH update profile visiblity
router.patch("/update-visibility/:uid", updateVisibility); //toggle-visibility

//PATCH update userRole (userType)
router.patch("/update-role/:uid", updateUserRole); //deprecated

//PATCH update creator profile
router.patch("/update-creator/:uid", fileUpload.single("image"), updateCreator); //deprecated - use update profile

//PATCH add credits
router.patch("/:uid/add-credits", addCredits); //deprecated

//PATCH update Profile
router.patch(
  "/update-profile/:uid",
  fileUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdfResume', maxCount: 1 }
  ]),
  updateUserProfile
);
router.delete("/remove-application-from-job/:userId", removeApplicationFromJob);
router.delete("/remove-applicants", removeApplicantsById);
router.delete("/remove-recruits-by-id", removeRecruitById);
router.delete("/delete-user-by-id", deleteUserById);
router.delete("/delete-pdf-resume/:userId", deletePdfResume);

module.exports = router;
