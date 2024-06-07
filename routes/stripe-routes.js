const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");
const createStripeCheckout = require("../controllers/stripe/createStripeCustomerSession");
const bodyParser = require("body-parser");
const stripeWebhook = require("../controllers/stripe/webhook");

//router.get("/:stripeCustomerId/charges", checkAuth);
//middleware to check for invalid token request

//router.use(checkAuth);

router.post("/:userId/create-stripe-checkout", createStripeCheckout);
//router.post("/delete-customer", checkAuth);

router.post(
  "/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
