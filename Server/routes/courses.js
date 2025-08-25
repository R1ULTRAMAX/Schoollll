const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const auth = require('../middleware/auth'); // <-- 1. Import the middleware

// --- Get all enrolled courses for the LOGGED-IN student ---
// GET /api/courses/my-courses
router.get('/my-courses', auth, async (req, res) => { // <-- 2. Protect route and remove :userId
    try {
        // 3. Use req.user.id from the token, not req.params.userId
        const user = await User.findById(req.user.id).populate('enrolledCourses');
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
router.get('/:courseId', auth, async (req, res) => { // <-- Protect route
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
// POST /api/courses/:courseId/homework/:homeworkId/submit
router.post('/:courseId/homework/:homeworkId/submit', auth, async (req, res) => { // <-- Protect route
    try {
        // Get studentId from the secure token, not the request body
        const userId = req.user.id;
        const { fileUrl } = req.body;
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const homework = course.homeworks.id(req.params.homeworkId);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }
        
        // Add or update the submission for this student
        const submissionIndex = homework.submissions.findIndex(sub => sub.studentId.toString() === userId);

        if (submissionIndex > -1) {
            // Update existing submission
            homework.submissions[submissionIndex].fileUrl = fileUrl;
            homework.submissions[submissionIndex].submittedAt = new Date();
        } else {
            // Add new submission
            homework.submissions.push({ studentId: userId, fileUrl: fileUrl });
        }
        
        await course.save();

        res.json({ message: 'Homework submitted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;