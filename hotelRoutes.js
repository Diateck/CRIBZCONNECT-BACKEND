const express = require('express');
const router = express.Router();
const auth = require('./authMiddleware');
const Hotel = require('./hotel');

// Create hotel listing
router.post('/', auth, async (req, res) => {
  try {
    const hotel = new Hotel({ ...req.body, userId: req.user.userId });
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
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
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
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
