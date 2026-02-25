const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jobRoutes = require("./routes/job-routes");
const userRoutes = require("./routes/user-routes");
const blogRoutes = require("./routes/blog-routes");
const stripeRoutes = require("./routes/stripe-routes");
const screeningRoutes = require("./routes/screening-routes");
const checkJobExpiration = require("./controllers/jobs/check-job-expiration");
const HttpError = require("./models/http-error");
const cron = require("node-cron");
const { facebookCallback } = require("./lib/socialMediaBoost");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { setupSocket } = require("./lib/socket");
const chatsCron = require("./controllers/chats/chats-cron");

const allowedOrigins = process.env.NODE_ENV === "production"
? ["https://ajarnjobs.com"]
: ["http://localhost:3000"];

const app = express();
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  }
});

io.engine.on('connection_error', (err) => {
  console.log('Socket.IO server error:', err);
});

setupSocket(io);

app.use("/api/stripe", stripeRoutes); // add routes!!!

app.use(bodyParser.json());
app.get("/api/facebook/callback", facebookCallback);
//app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api/jobs", jobRoutes); // => /api/jobs/...
app.use("/api/user", userRoutes); // => /api/users/...
app.use("/api/blog", blogRoutes); // => /api/blog/...
app.use("/api/screenings", screeningRoutes);

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
  chatsCron();
});

mongoose
  .connect(process.env.MONGO_DB_STRING)
  .then(() => {
    server.listen(process.env.PORT || 5001);
    console.log("App is Listening");
  })
  .catch((err) => console.log(err));