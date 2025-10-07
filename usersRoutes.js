
const express = require('express');
const router = express.Router();
const User = require('./user');

// POST: Credit agent balance
router.post('/credit', async (req, res) => {
  try {
    const { agentId, amount } = req.body;
    if (!agentId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid agent or amount' });
    }
    const user = await User.findById(agentId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.balance = (user.balance || 0) + amount;
    await user.save();
    res.json({ message: 'Balance credited', userId: user._id, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all users (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
