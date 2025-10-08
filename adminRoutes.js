// GET: Withdrawal requests (type: payout)
router.get('/withdrawals', async (req, res) => {
  try {
    // Find all payout transactions
    const withdrawals = await Transaction.find({ type: 'payout' }).sort({ createdAt: -1 });
    // Populate agent info for each withdrawal
    const User = require('./user');
    const results = await Promise.all(withdrawals.map(async (w) => {
      let agentName = '';
      try {
        const agent = await User.findById(w.agentId);
        agentName = agent ? (agent.fullName || agent.username || agent.email) : '';
      } catch {}
      return {
        _id: w._id,
        agentId: w.agentId,
        agentName,
        amount: w.amount,
        description: w.description,
        status: w.status,
        createdAt: w.createdAt
      };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
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

    // Total balance: sum of all user balances
    const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

    // Currency conversion: XAF to USD ($) (example rate: 1 USD = 600 XAF)
    const USD_RATE = 600;
    const totalRevenueUSD = totalRevenue ? (totalRevenue / USD_RATE) : 0;
    const totalBalanceUSD = totalBalance ? (totalBalance / USD_RATE) : 0;

    res.json({
      totalProperties,
      totalUsers,
      verifiedAgents,
      totalRevenue: totalRevenueUSD,
      totalBalance: totalBalanceUSD,
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
