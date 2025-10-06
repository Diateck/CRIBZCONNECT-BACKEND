require("dotenv").config();
// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const listingRoutes = require("./listingRoutes");
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));
