const HttpError = require("../models/http-error");
let { DUMMY_USERS_LIST } = require("../dummy_data/dummy_users");
let dummy_jobs = require("../dummy_data/dummy_jobs");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

//GET all users
const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS_LIST });
};

//GET userById
const getUserById = (req, res, next) => {
  //get user by dynamic id we set in routes /:uid
  let userId = req.params.uid;
  //match the user id in our object with the user id in request
  let user = DUMMY_USERS_LIST.find((u) => u.id === userId);

  //no match, throw an error
  if (!user) {
    const error = new HttpError("Could not find user by this id.", 404);
    throw error;
  }

  //json object of user data
  res.json({ user });
};

//POST user sign-up
const signup = (req, res, next) => {
  //make sure user inputs satisfy requirments
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "Please check check that your inputs match requirements and try again. Passwords must be at least 7 characters long and contain 1 number",
      422
    );
  }
  //we expect name, email and password
  const { name, email, password } = req.body;

  //check if e-mail already exists
  const hasUser = DUMMY_USERS_LIST.find((u) => u.email === email);
  if (hasUser) {
    throw new Error("A user already exists under the current e-mail.");
  }

  //for now pass the data in a object with unique id.
  const createdUser = { id: uuidv4(), name, email, password };

  //push that data to our list of objects
  DUMMY_USERS_LIST.push(createdUser);

  //render json data of new user
  res.status(201).json({ user: createdUser });
};

//POST user login
const login = (req, res, next) => {
  //make sure the user actually enters something
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("please enter a valid email and password");
  }

  //check if user exists
  const { email, password } = req.body;

  //match userId to id in request
  const identifiedUser = DUMMY_USERS_LIST.find((u) => u.email === email);

  //if user data does not exist, throw an error.
  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError(
      "there was an issue with logging you in. Check your email or password.",
      401
    );
    throw error;
  }

  //return successful login message
  res.status(200).json({ message: "logged in" });
};

//PATCH add credits to user
const addCredits = (req, res, next) => {
  // Get user ID from request parameters
  const userId = req.params.uid;

  // Get credits from request body
  const { credits } = req.body;

  // Find the user by ID in the dummy users list (shallow copy)
  const user = { ...DUMMY_USERS_LIST.find((u) => u.id === userId) };

  //if the user doesn't exist, throw an error
  if (!user) {
    const error = new HttpError("could not find user by this id", 401);
    throw error;
  }
  // Find the index of the user in the dummy users list
  const userIndex = DUMMY_USERS_LIST.findIndex((u) => u.id === userId);

  // Add credits to the user's credits
  user.credits += credits;

  // Update the user in the dummy users list
  DUMMY_USERS_LIST[userIndex] = user;

  // Send a JSON response with a success message
  res.status(200).json({ message: `added: ${credits} credits` });
};

//POST apply to jobs
const applyToJobById = (req, res, next) => {
  //validate data
  const errors = validationResult(req);

  //if there are any errors throw an error
  if (!errors.isEmpty()) {
    throw new HttpError(
      "You must be a teacher to apply + resume and cover letters must not be empty.",
      500
    );
  }

  //request parameters for dynamic ids
  const userId = req.params.uid;
  const jobId = req.params.jid;

  //destructure request.body
  const { userType, coverLetter } = req.body;

  //only teachers can apply to jobs
  if (userType !== "teacher") {
    throw new HttpError("You must be a teacher to apply to jobs.", 404);
  }

  //find the user who is applying for the job by id.
  const user = DUMMY_USERS_LIST.find((user) => user.id === userId);

  //find the job the user is applying for by id.
  const job = dummy_jobs.find((job) => job.id === jobId);

  //30 day math calculation from date application is submitted to date (30 days)
  let now = new Date();
  //30 days * 24 hours in a day * 60 minutes in an hours * 60 seconds in a minute * 1000 = 30 days in milliseconds
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  //check for any prior association with current job id within the last 30 days
  const userAppliedAlready = user.applications.some((application) => {
    //check for match by id
    if (application.jobId === jobId) {
      //if there is a match create a new Date object and set it to application date
      const applicationDate = new Date(application.applicationDate);
      //simple subtraction
      const timeSinceLastApplication = now - applicationDate;
      //if it hasn't been at least 30 days, then we return false
      return timeSinceLastApplication <= thirtyDays;
    }
    return false;
  });

  //if true, throw an error because user has applied already.
  if (userAppliedAlready) {
    throw new HttpError(`'You may only apply to a job once every 30 days'`);
  }

  //submit resume with unique id and the current date/time.
  const submitResume = {
    resumeId: uuidv4(),
    applicationDate: new Date().toISOString(),
    name: user.name,
    coverLetter,
    resume: user.resume,
  };

  //if not the correct user, throw an error
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  //if not the correct job, throw an error.
  if (!job) {
    throw new HttpError("Job not found", 404);
  }

  //if job.applicants property does not already exist, create one and set to empty arrray;
  if (!job.applicants) {
    job.applicants = [];
  }

  //push the resume to applicants array in job object;
  job.applicants.push(submitResume);

  //if the user is a teacher and they don't have an applications property, create one. Set to empty array.
  if (userType === "teacher") {
    if (!user.applications) {
      user.applications = [];
    }
    //push the resumeId as a reference to the job they applied for.
    user.applications.push({
      id: submitResume.resumeId,
      jobId: jobId,
      applicationDate: new Date(),
    });
  }
  //upon succesful submission, render success message.
  res.status(200).json({ message: "Application submitted" });
};

const userIsVisible = (req, res, next) => {};

exports.applyToJobById = applyToJobById;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.addCredits = addCredits;
