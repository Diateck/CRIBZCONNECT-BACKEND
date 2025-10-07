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
const favoriteRoutes = require("./favoriteRoutes");
const reservationRoutes = require("./reservationRoutes");
const usersRoutes = require("./usersRoutes");
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", usersRoutes);

// Hotel routes
const hotelRoutes = require("./hotelRoutes");
app.use("/api/hotels", hotelRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    // ensure default admin exists
    try {
      const ensureAdmin = require('./ensureAdmin');
      ensureAdmin();
    } catch (err) {
      console.error('Could not run ensureAdmin:', err);
    }
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));
