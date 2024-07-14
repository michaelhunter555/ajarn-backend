const express = require("express");
const router = express.Router();
const createStripeCheckout = require("../controllers/stripe/createStripeCustomerSession");
const bodyParser = require("body-parser");
const stripeWebhook = require("../controllers/stripe/webhook");
const getUserBillingData = require("../controllers/stripe/get-user-billing-data");
const checkAuth = require("../middleware/auth");
//router.get("/:stripeCustomerId/charges", checkAuth);
//middleware to check for invalid token request

//router.use(checkAuth);

router.post(
  "/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

//check token for creating checkouts and retrieving billing data.
router.use(checkAuth);
router.get("/user-billing/:userId", getUserBillingData);
router.post("/:userId/create-stripe-checkout", createStripeCheckout);
//router.post("/delete-customer", checkAuth);

module.exports = router;
