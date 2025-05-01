const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const UserRouter = require("./routers/userRouter")

app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Defind Router
app.use("/api/user", UserRouter);

module.exports = app;
