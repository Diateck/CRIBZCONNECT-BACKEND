const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nativeLanguage: { type: String, default: '' },
    otherLanguage: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'agent', 'client'], default: 'client' },
    displayName: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    paymentMethodAdded: { type: Boolean, default: false },
    profileInfoCompleted: { type: Boolean, default: false },
    passwordChanged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    balance: { type: Number, default: 0 } // Agent wallet balance
});
module.exports = mongoose.model('User', userSchema);