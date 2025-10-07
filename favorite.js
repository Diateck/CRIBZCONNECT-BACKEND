const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Favorite', favoriteSchema);