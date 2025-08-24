const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
// A middleware to protect routes will be added later (auth.js)

// --- Get all enrolled courses for a student ---
// GET /api/courses/my-courses/:userId
router.get('/my-courses/:userId', async (req, res) => {
    try {
        // Find the user and populate the enrolledCourses field with actual course data
        const user = await User.findById(req.params.userId).populate('enrolledCourses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.enrolledCourses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Get details for a single course ---
// GET /api/courses/:courseId
router.get('/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Submit homework ---
// This is a simplified version. A real-world app would handle file uploads.
// POST /api/courses/:courseId/homework/:homeworkId/submit
router.post('/:courseId/homework/:homeworkId/submit', async (req, res) => {
    try {
        const { userId, fileUrl } = req.body; // Assuming userId and fileUrl are sent in the request
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the specific homework within the course
        const homework = course.homeworks.id(req.params.homeworkId);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        // Add the new submission
        homework.submissions.push({ studentId: userId, fileUrl: fileUrl });
        await course.save();

        res.json({ message: 'Homework submitted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
