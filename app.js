const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const UserRouter = require("./routers/userRouter");
const CategoryRouter = require("./routers/categoryRouter");
const ProductRouter = require("./routers/productRouter");

app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Defind Router
app.use("/api/user", UserRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/product", ProductRouter);

module.exports = app;
