const express = require('express');
const router = express.Router();
const User = require('./user');
const Transaction = require('./transaction'); // If you have a transaction model

// GET: Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Example stats, replace with your own logic
    const totalRevenue = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const platformCommission = 0; // Replace with actual logic
    const agentEarnings = 0; // Replace with actual logic
    const serviceFees = 0; // Replace with actual logic
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      platformCommission,
      agentEarnings,
      serviceFees,
      totalRevenueChange: '+0%',
      platformCommissionChange: '+0%',
      agentEarningsChange: '+0%',
      serviceFeesChange: '+0%'
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
