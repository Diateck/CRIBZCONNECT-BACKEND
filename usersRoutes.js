
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
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    agent.balance = (agent.balance || 0) + amount;
    await agent.save();
    res.json({ message: 'Balance credited', agentId: agent._id, newBalance: agent.balance });
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
