const HttpError = require("../models/http-error");
let { DUMMY_USERS_LIST } = require("../dummy_data/dummy_users");
const { v4: uuidv4 } = require("uuid");

//get all users
const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS_LIST });
};

//get userById
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

//user sign-up
const signup = (req, res, next) => {
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

//user login
const login = (req, res, next) => {
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

const addCredits = (req, res, next) => {
  // Get user ID from request parameters
  const userId = req.params.uid;
  // Get credits from request body
  const { credits } = req.body;
  // Find the user by ID in the dummy users list (shallow copy)
  const user = { ...DUMMY_USERS_LIST.find((u) => u.id === userId) };

  if (!user) {
    const error = new HttpError("could not find user by this id", 401);
    throw error;
  }
  // Find the index of the user in the dummy users list
  const userIndex = DUMMY_USERS_LIST.findIndex((u) => u.id === userId);
  // Add 1 credit to the user's credits
  user.credits += credits;
  // Update the user in the dummy users list
  DUMMY_USERS_LIST[userIndex] = user;
  // Send a JSON response with a success message
  res.status(200).json({ message: `added: ${credits} credits` });
};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.addCredits = addCredits;
