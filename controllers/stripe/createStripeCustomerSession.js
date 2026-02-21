const User = require("../../models/users");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeCheckout = async (req, res, next) => {
  const userId = req.params.userId;
  const { priceId, credits } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const agency = "price_1T2BhlRpnv4ckgZhMthFDiLR";// test-"price_1PNxLvRpnv4ckgZhMFUfhKqZ";
  const enterprise = "price_1T2BinRpnv4ckgZh8KbsopoA";// test-"price_1PNxMiRpnv4ckgZhTjkWZrsD";
  const canDiscount = priceId === agency || priceId === enterprise;

  let customer;

  if (!user.stripeCustomerId) {
    customer = await stripe.customers.create({
      email: user?.email,
      name: user?.name,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  if (user?.stripeCustomerId) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }], // priceId
        mode: "payment",
        customer: user.stripeCustomerId,
        success_url: `${req.headers.origin}/users/${userId}?stripe=success`,
        cancel_url: `${req.headers.origin}/users/${userId}?stripe=cancel`,
        metadata: {
          userId: user?._id.toString(),
          credits: credits,
        },
        ...(canDiscount
          ? {
              discounts: [
                {
                  coupon: "UG6vqhaL",// test-"u8IMpn21",
                },
              ],
            }
          : {}),
      });

      res.status(200).json({
        url: session?.url,
        ok: true,
      });
    } catch (err) {
      res.status(500).json({
        message: "there was an error with your request: " + err,
        ok: false,
      });
    }
  }
};

module.exports = createStripeCheckout;
