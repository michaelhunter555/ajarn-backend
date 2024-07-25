const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jobRoutes = require("./routes/job-routes");
const userRoutes = require("./routes/user-routes");
const blogRoutes = require("./routes/blog-routes");
const stripeRoutes = require("./routes/stripe-routes");
const checkJobExpiration = require("./controllers/jobs/check-job-expiration");
const HttpError = require("./models/http-error");
const cron = require("node-cron");
const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/stripe-webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

//app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use("/api/jobs", jobRoutes); // => /api/jobs/...
app.use("/api/user", userRoutes); // => /api/users/...
app.use("/api/blog", blogRoutes); // => /api/blog/...
app.use("/api/stripe", stripeRoutes); // add routes!!!

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

cron.schedule("0 0 * * *", () => {
  console.log("midnight job ran.");
  checkJobExpiration();
});

mongoose
  .connect(process.env.MONGO_DB_STRING)
  .then(() => {
    app.listen(process.env.PORT || 5000);
    console.log("App is Listening");
  })
  .catch((err) => console.log(err));
