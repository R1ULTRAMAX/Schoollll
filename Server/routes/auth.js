const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- Student Registration (for setup purposes) ---
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { rollNo, password } = req.body;
    try {
        let user = await User.findOne({ rollNo });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ rollNo, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- Student Login ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { rollNo, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User matched, create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token, userId: user.id });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
