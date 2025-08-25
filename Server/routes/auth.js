const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- User Registration ---
// POST /api/auth/register
router.post('/register', async (req, res) => {
    // <-- MODIFIED: Entire route updated for secure teacher registration
    const { rollNo, password, teacherCode } = req.body;

    try {
        let user = await User.findOne({ rollNo });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const newUser = { rollNo, password };

        // Check for a teacher registration code
        if (teacherCode) {
            if (teacherCode === process.env.TEACHER_SECRET_CODE) {
                newUser.role = 'teacher';
            } else {
                return res.status(401).json({ msg: 'Invalid teacher code.' });
            }
        }
        // If no teacherCode, role defaults to 'student' via the schema

        user = new User(newUser);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- User Login ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { rollNo, password } = req.body;

  try {
    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // <-- MODIFIED: Payload now includes role
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        // <-- MODIFIED: Response now includes role
        res.json({ token, userId: user.id, role: user.role });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;