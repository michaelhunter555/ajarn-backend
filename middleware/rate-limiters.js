const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const ipKey = (req) => ipKeyGenerator(req.ip) || "unknown";
const userOrIpKey = (req) => req.userData?.userId?.toString() || ipKey(req);

const createLimiter = ({
  windowMs,
  max,
  message,
  keyGenerator,
  skipSuccessfulRequests = false,
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests,
    message: { message, ok: false },
    handler: (req, res) => {
      return res.status(429).json({ message, ok: false });
    },
  });

const rateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later.",
  keyGenerator: ipKey,
});

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: ipKey,
  skipSuccessfulRequests: true,
});

const signupLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 6,
  message: "Too many signup attempts. Please try again later.",
  keyGenerator: ipKey,
});

const authBootstrapLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication requests. Please try again later.",
  keyGenerator: ipKey,
});

const profileUpdateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many profile updates. Please try again later.",
  keyGenerator: userOrIpKey,
});

const supportLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: "Too many support or feedback requests. Please try again later.",
  keyGenerator: userOrIpKey,
});

const generateCoverLetterLimiter = createLimiter({
  windowMs: 1 * 24 * 60 * 60 * 1000,
  max: 3,
  message: "Too many cover letter generation requests. Please try again later.",
  keyGenerator: userOrIpKey,
});

const aiGenerateJobDescriptionLimiter = createLimiter({
  windowMs: 1 * 24 * 60 * 60 * 1000,
  max: 3,
  message: "Too many AI job description generation requests. Please try again later.",
  keyGenerator: userOrIpKey,
});

const jobCreateLimiter = createLimiter({
  windowMs: 30 * 60 * 1000,
  max: 15,
  message: "Too many job creation requests. Please try again later.",
  keyGenerator: userOrIpKey,
});

const recruitLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: "Too many recruitment actions. Please slow down.",
  keyGenerator: userOrIpKey,
});

const billingLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Too many billing requests. Please try again later.",
  keyGenerator: userOrIpKey,
});

const blogWriteLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 80,
  message: "Too many blog actions. Please slow down.",
  keyGenerator: userOrIpKey,
});

module.exports = {
  rateLimiter,
  loginLimiter,
  signupLimiter,
  authBootstrapLimiter,
  profileUpdateLimiter,
  supportLimiter,
  jobCreateLimiter,
  recruitLimiter,
  billingLimiter,
  blogWriteLimiter,
  generateCoverLetterLimiter,
  aiGenerateJobDescriptionLimiter,
};