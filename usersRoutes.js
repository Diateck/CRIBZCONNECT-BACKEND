const express = require('express');
const router = express.Router();
const User = require('./user');

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
