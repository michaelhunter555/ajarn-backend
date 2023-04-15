const express = require("express");
const bodyParser = require("body-parser");
const jobRoutes = require("./routes/job-routes");

const app = express();
app.use(jobRoutes);

app.listen(5000);
