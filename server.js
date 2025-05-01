require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.MONGODB_URL_LOCAL).then(() => {
  console.log("MongoDB connected successfully.");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});