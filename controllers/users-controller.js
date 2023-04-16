const HttpError = require("../models/http-error");
let { DUMMY_USERS_LIST } = require("../dummy_data/dummy_users");
const { v4: uuidv4 } = require("uuid");

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
  res.status(200).json({ user });
};

//user sign-up
const signup = (req, res, next) => {
  //we expect name, email and password
  const { name, email, password } = req.body;

  //for now pass the data in a object with unique id.
  const createdUser = { id: uuidv4(), name, email, password };

  //push that data to our list of objects
  DUMMY_USERS_LIST.push(createdUser);

  //render json data of new user
  res.status(201).json({ newUser: createdUser });
};

//user login
const login = (req, res, next) => {
  //request params for user id /:uid
  const userId = req.params.uid;

  //match userId to id in request
  const user = DUMMY_USERS_LIST.find((u) => u.id === userId);

  //if user data does not exist, throw an error.
  if (!user) {
    const error = new HttpError("there was an issue with logging you in", 404);
    throw error;
  }

  //return successful login message
  res.status(200).json({ message: "logged in" });
};

const addCredits = (req, res, next) => {
  // Get user ID from request parameters
  const userId = req.params.uid;
  // Get credits from request body
  const { credits } = req.body;
  // Find the user by ID in the dummy users list (shallow copy)
  const user = { ...DUMMY_USERS_LIST.find((u) => u.id === userId) };
  // Find the index of the user in the dummy users list
  const userIndex = DUMMY_USERS_LIST.findIndex((u) => u.id === userId);
  // Add 1 credit to the user's credits
  user.credits = credits + 1;
  // Update the user in the dummy users list
  DUMMY_USERS_LIST[userIndex] = user;
  // Send a JSON response with a success message
  res.status(200).json({ message: "added 1 credit" });
};

exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.addCredits = addCredits;
