const express = require('express');
const router = express.Router();
const User = require('./user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key'; // Change this in production

// Registration
router.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Registration successful.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
    const token = jwt.sign({ userId: user._id, fullName: user.fullName, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful.', token, fullName: user.fullName, username: user.username, email: user.email });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
