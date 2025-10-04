const User = require("../../models/users");
const Billing = require("../../models/billing");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { 
  handleAdminStripeTransactionNotification,
  handleCustomerStripeTransactionNotification
} = require("../../lib/brevoHelper");

const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET.trim();

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  //console.log("Successfully Signed webhook");

  try {
    switch (event.type) {
      case "checkout.session.completed":
        {
          const purchase = event.data.object;
          const paymentIntent = await stripe.paymentIntents.retrieve(purchase.payment_intent, {
            expand: ["latest_charge"],
          });
          const charge = paymentIntent?.latest_charge;

        //  console.log("charge", charge);

          const user = await User.findOne({
            stripeCustomerId: purchase.customer,
          });

          if (user) {
            user.credits += parseInt(
              purchase.metadata.credits,
              10
            );

            const billingData = {
              userId: user?._id,
              purchaseDate: new Date(purchase.created * 1000),
              purchaseAmount: purchase.amount_total,
            };
            const newBillingObject = new Billing(billingData);

            await newBillingObject.save();
            user.billingData.push(newBillingObject._id);
            await user.save();

            const amountFormatted = (purchase.amount_total / 100).toFixed(2);

            await handleAdminStripeTransactionNotification(user, amountFormatted, charge);
            await handleCustomerStripeTransactionNotification(user, amountFormatted, charge);
          }
        }
        break;
      default:
        console.log("err, callback unhandled");
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err}`);
    res.status(400).send(`Webhook Error: ${err}`);
  }
};

module.exports = stripeWebhook;
