const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jobRoutes = require("./routes/job-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");
const app = express();

app.use(bodyParser.json());
app.use("/api/jobs", jobRoutes); // => /api/jobs/...
app.use("/api/user", userRoutes); // => /api/users/...

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

mongoose
  .connect(process.env.MONGO_DB_STRING)
  .then(() => {
    console.log("connected");
    app.listen(5000);
  })
  .catch((err) => console.log(err));
