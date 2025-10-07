const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'payout'], required: true }, // credit: admin credits agent, payout: agent withdraws
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who performed the credit (admin)
});

module.exports = mongoose.model('Transaction', transactionSchema);
