const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  rooms: { type: Number, required: false },
  days: { type: Number, required: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);