const express = require('express');
const router = express.Router();
const Favorite = require('./favorite');

// Add a favorite
router.post('/:listingId', async (req, res) => {
  try {
    const { customerId, agentId } = req.body;
    const favorite = new Favorite({ listingId: req.params.listingId, customerId, agentId });
    await favorite.save();
    res.status(201).json(favorite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all favorites for an agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const favorites = await Favorite.find({ agentId: req.params.agentId }).populate('listingId customerId');
    res.json(favorites);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;