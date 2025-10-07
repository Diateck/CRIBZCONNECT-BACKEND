const bcrypt = require('bcryptjs');
const User = require('./user');
require('dotenv').config();

async function ensureAdmin() {
  try {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'Cribzconnect';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123';
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@cribzconnect.com';

    // find any admin user by username or role
    let admin = await User.findOne({ username, role: 'admin' });
    const hashed = await bcrypt.hash(password, 10);

    if (!admin) {
      admin = new User({
        fullName: 'Super Admin',
        username,
        email,
        password: hashed,
        role: 'admin',
        passwordChanged: false
      });
      await admin.save();
      console.log('✅ Default admin created (ensureAdmin)');
    } else {
      // update password/email to match default (idempotent)
      admin.password = hashed;
      admin.email = email;
      admin.passwordChanged = false;
      await admin.save();
      console.log('✅ Default admin updated (ensureAdmin)');
    }
  } catch (err) {
    console.error('❌ Error ensuring default admin:', err);
  }
}

module.exports = ensureAdmin;
