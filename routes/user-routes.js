const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");

//GET find user by id
router.get("/:uid", usersController.getUserById);
//POST sign-up post
router.post("/sign-up", usersController.signup);
//POST login
router.post("/login", usersController.login);
//PATCH add credits
router.patch("/:uid/add-credits", usersController.addCredits);

module.exports = router;
