const express = require('express');
const router = express.Router();
const auth = require('./authMiddleware');
const Hotel = require('./hotel');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create hotel listing
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    // Validate required fields
    const { name, address, price } = req.body;
    if (!name || !address || !price) {
      return res.status(400).json({ message: 'Missing required fields: name, address, price.' });
    }
    // Parse amenities
    let amenities = [];
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) {
        amenities = req.body.amenities;
      } else {
        amenities = req.body.amenities.split(',').map(a => a.trim()).filter(Boolean);
      }
    }
    // Handle images: upload to Cloudinary and save URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Cloudinary upload_stream returns a writable stream
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
            } else {
              images.push(result.secure_url);
            }
          }
        );
        stream.end(file.buffer);
        // Wait for upload to finish before continuing
        await new Promise(resolve => stream.on('finish', resolve));
      }
    }
    // Ensure userId is present
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing from token.' });
    }
    // Build hotel object
    const hotel = new Hotel({
      name,
      address,
      price,
      description: req.body.description || '',
      rooms: req.body.rooms || 1,
      amenities,
      images,
      userId: req.user.userId
    });
    
    module.exports = router;
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    console.error('Hotel creation error:', err);
    res.status(500).json({ message: 'Error creating hotel', error: err.message });
  }
});

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hotels', error: err.message });
  }
});

// Get hotels for logged-in user
router.get('/me', auth, async (req, res) => {
  try {
    const hotels = await Hotel.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user hotels', error: err.message });
  }
});

// Update hotel listing
router.put('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: 'Error updating hotel', error: err.message });
  }
});

// Delete hotel listing

router.delete('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting hotel', error: err.message });
  }
});

module.exports = router;
