require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

// Serve your portfolio website from /public
app.use(express.static(path.join(__dirname, "public")));

// API Base Route
app.use("/api/cases", require("./routes/cases")(client));

const PORT = process.env.PORT || 5959;

client.connect().then(() => {
  console.log("Successfully connected to MongoDB!");
  app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
  });
});
