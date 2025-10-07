const express = require('express');
const router = express.Router();
const Reservation = require('./reservation');

// Add a reservation
router.post('/:listingId', async (req, res) => {
  try {
    const { customerId, agentId, name, phone, address, rooms, days } = req.body;
    const reservation = new Reservation({
      listingId: req.params.listingId,
      customerId,
      agentId,
      name,
      phone,
      address,
      rooms,
      days
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all reservations for an agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ agentId: req.params.agentId }).populate('listingId customerId');
    res.json(reservations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;