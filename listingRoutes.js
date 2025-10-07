// routes/listingRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const Listing = require("./listing");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : undefined
});

// Setup multer for image uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ CREATE a new listing (with images)
// For listing creation we accept multipart/form-data. Run multer first so
// the form fields (including token) are available to authMiddleware.
router.post("/", upload.array("images", 10), authMiddleware, async (req, res) => {
  try {
    console.log("Received POST /api/listings");
    console.log("Request headers:", req.headers); // Log headers for debugging
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    const imageFiles = req.files;
    let imageUrls = [];

    // Upload each image to Cloudinary
    for (const file of imageFiles) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "real_estate_listings" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        imageUrls.push(uploadResult.secure_url);
      } catch (imgErr) {
        console.error("Cloudinary upload error:", imgErr);
        throw imgErr;
      }
    }

    // Save the listing in MongoDB
    try {
      const newListing = new Listing({
        ...req.body,
        images: imageUrls,
        userId: new mongoose.Types.ObjectId(req.user.userId), // Ensure ObjectId type
        status: 'pending'
      });
      try {
        const savedListing = await newListing.save();
        res.status(201).json(savedListing);
      } catch (dbErr) {
        if (dbErr.name === 'ValidationError') {
          console.error('Validation error:', dbErr.errors);
          res.status(400).json({ message: 'Validation error', errors: dbErr.errors });
        } else {
          console.error("MongoDB save error:", dbErr);
          res.status(500).json({ message: dbErr.message });
        }
      }
    } catch (err) {
      console.error("Error in /api/listings (outer):", err);
      res.status(500).json({ message: err.message });
    }
// PATCH endpoint to approve listing (admin only)
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error approving listing', error: err.message });
  }
});
// GET listings by status (for admin sorting/filtering)
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const listings = await Listing.find({ status });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings by status', error: err.message });
  }
});
  } catch (error) {
    console.error("Error in /api/listings:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET all listings
// Get all listings or filter by userId
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get listings for authenticated user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Log the user object
    const listings = await Listing.find({ userId: req.user.userId });
    console.log('Listings found for user:', listings); // Log the listings found
    res.json(listings);
  } catch (error) {
    console.error("Error in /api/listings/me:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET a single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ UPDATE a listing by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedListing) return res.status(404).json({ message: 'Listing not found' });
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ DELETE a listing by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);
    if (!deletedListing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
