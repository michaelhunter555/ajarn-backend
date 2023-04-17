const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users-controller");

//GET all users
router.get("/", usersController.getUsers);
//GET find user by id
router.get("/:uid", usersController.getUserById);
//PATCH add credits
router.patch("/:uid/add-credits", usersController.addCredits);
//POST sign-up post
router.post("/sign-up", usersController.signup);
//POST login
router.post("/login", usersController.login);

module.exports = router;
