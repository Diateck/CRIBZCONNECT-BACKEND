const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  rooms: { type: Number, default: 1 },
  amenities: { type: [String], default: [] },
  price: { type: Number, required: true },
  images: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'published', 'draft'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
