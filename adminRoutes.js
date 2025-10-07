const express = require('express');
const router = express.Router();
const User = require('./user');
const Transaction = require('./transaction'); // If you have a transaction model

// GET: Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const User = require('./user');
    const Listing = require('./listing');
    const Hotel = require('./hotel');

    // Get all users
    const users = await User.find();
    // Get all listings and hotels
    const listings = await Listing.find({ status: 'published' });
    const hotels = await Hotel.find({ status: 'published' });

    // Stats
    const totalProperties = listings.length + hotels.length;
    const totalUsers = users.length;
    const verifiedAgents = users.filter(u => u.role === 'agent' && u.verified).length;

    // Total revenue: sum of all published listing and hotel prices
    const totalRevenue = [...listings, ...hotels].reduce((sum, p) => sum + (p.price || 0), 0);

    // Currency conversion: XAF to USD ($) (example rate: 1 USD = 600 XAF)
    const USD_RATE = 600;
    const totalRevenueUSD = totalRevenue ? (totalRevenue / USD_RATE) : 0;

    res.json({
      totalProperties,
      totalUsers,
      verifiedAgents,
      totalRevenue: totalRevenueUSD,
      currency: '$',
      totalPropertiesChange: '+0%',
      totalUsersChange: '+0%',
      verifiedAgentsChange: '+0%',
      dashboardRevenueChange: '+0%'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Admin transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
