// Script to create or update the default admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

async function createOrUpdateAdmin() {
  await mongoose.connect(MONGO_URI);
  const username = 'Cribzconnect';
  const password = 'Admin123';
  const hashed = await bcrypt.hash(password, 10);
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = new User({
      fullName: 'Super Admin',
      username,
      email: 'admin@cribzconnect.com',
      password: hashed,
      role: 'admin',
      passwordChanged: false
    });
    await admin.save();
    console.log('Default admin created.');
  } else {
    admin.username = username;
    admin.password = hashed;
    admin.passwordChanged = false;
    await admin.save();
    console.log('Default admin password reset.');
  }
  mongoose.disconnect();
}

createOrUpdateAdmin();
