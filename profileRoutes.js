
const express = require('express');
const router = express.Router();
const auth = require('./authMiddleware');
const User = require('./user');
const Transaction = require('./transaction');

// POST request payout
router.post('/request-payout', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { payoutAmount, payoutDetails } = req.body;
    if (!payoutAmount || payoutAmount < 50000) {
      return res.status(400).json({ message: 'Minimum payout amount is 50,000 FCFA' });
    }
    // Find user and check balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if ((user.balance || 0) < payoutAmount) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
    }
    // Deduct payout amount from balance
    user.balance = (user.balance || 0) - payoutAmount;
    await user.save();
    // Save payout request as a transaction
    const transaction = new Transaction({
      agentId: userId,
      type: 'payout',
      amount: payoutAmount,
      description: JSON.stringify(payoutDetails),
      status: 'pending'
    });
    await transaction.save();
    res.json({ message: 'Payout request submitted successfully', transaction, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST verification
router.post('/verify', auth, async (req, res) => {
  try {
    // Example: mark user as verified
    const user = await User.findByIdAndUpdate(req.user.userId, { verified: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST payment method
router.post('/payment-method', auth, async (req, res) => {
  try {
    // Example: save payment method
    const user = await User.findByIdAndUpdate(req.user.userId, { paymentMethodAdded: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword; // You should hash this in production
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
