const getUsers = require("./get-users");
const getUserById = require("./get-user-by-id");
const updateVisibility = require("./update-visibility");
const signUp = require("./sign-up");
const login = require("./login");
const updateUserProfile = require("./update-user-profile");
const addCredits = require("./add-credits");
const applyToJob = require("./apply-to-job");

module.exports = {
  ...getUsers,
  ...getUserById,
  ...updateVisibility,
  ...signUp,
  ...login,
  ...updateUserProfile,
  ...addCredits,
  ...applyToJob,
};
