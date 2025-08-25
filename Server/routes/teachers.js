const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// Middleware to check if the user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ msg: 'Access denied. Teachers only.' });
  }
  next();
};

// --- (Teacher) Create a new course ---
// POST /api/teachers/courses
router.post('/courses', [auth, isTeacher], async (req, res) => {
  const { name, courseCode } = req.body;
  try {
    const newCourse = new Course({
      name,
      courseCode,
      teacher: req.user.id
    });
    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- (Teacher) Enroll a student in a course ---
// POST /api/teachers/courses/:courseId/enroll
router.post('/courses/:courseId/enroll', [auth, isTeacher], async (req, res) => {
  const { rollNo } = req.body;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const student = await User.findOne({ rollNo, role: 'student' });
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    // Security check: Ensure the teacher owns this course
    if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'You are not authorized to modify this course' });
    }

    // Add student and course to each other's lists if not already present
    if (!student.enrolledCourses.includes(courseId)) {
        student.enrolledCourses.push(courseId);
        await student.save();
    }
    if (!course.students.includes(student.id)) {
        course.students.push(student.id);
        await course.save();
    }

    res.json({ msg: 'Student enrolled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- (Teacher) Add homework to a course ---
// POST /api/teachers/courses/:courseId/homeworks
router.post('/courses/:courseId/homeworks', [auth, isTeacher], async (req, res) => {
    const { title, description, dueDate } = req.body;
    const { courseId } = req.params;

    // Simple validation
    if (!title || !description || !dueDate) {
        return res.status(400).json({ msg: 'Please provide title, description, and dueDate' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Security check: Ensure the teacher owns this course
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'You are not authorized to add homework to this course' });
        }

        const newHomework = {
            title,
            description,
            dueDate,
            submissions: [] // Start with an empty submissions array
        };

        // Add the new homework to the beginning of the array
        course.homeworks.unshift(newHomework);

        await course.save();

        res.status(201).json(course.homeworks); // Return the updated list of homeworks

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// --- (Teacher) Get all courses created by the teacher ---
// GET /api/teachers/my-courses
router.get('/my-courses', [auth, isTeacher], async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id }).populate('students', 'rollNo');
        res.json(courses);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================================
// --- NEW ENDPOINTS START HERE ---
// ==========================================================

// --- (Teacher) Add a lecture notification ---
// POST /api/teachers/courses/:courseId/lectures
router.post('/courses/:courseId/lectures', [auth, isTeacher], async (req, res) => {
    const { title, date, notification } = req.body;
    if (!title || !date || !notification) {
        return res.status(400).json({ msg: 'Please provide title, date, and notification' });
    }
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        course.lectures.unshift({ title, date, notification });
        await course.save();
        res.status(201).json(course.lectures);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- (Teacher) Update the syllabus ---
// PUT /api/teachers/courses/:courseId/syllabus
router.put('/courses/:courseId/syllabus', [auth, isTeacher], async (req, res) => {
    const { syllabus } = req.body;
    if (typeof syllabus !== 'string') {
        return res.status(400).json({ msg: 'Syllabus content is required' });
    }
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        course.syllabus = syllabus;
        await course.save();
        res.json({ syllabus: course.syllabus });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- (Teacher) Add a resource link ---
// POST /api/teachers/courses/:courseId/resources
router.post('/courses/:courseId/resources', [auth, isTeacher], async (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).json({ msg: 'Please provide a name and a url' });
    }
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        course.resources.push({ name, url });
        await course.save();
        res.status(201).json(course.resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- (Teacher) Add a quiz ---
// POST /api/teachers/courses/:courseId/quizzes
router.post('/courses/:courseId/quizzes', [auth, isTeacher], async (req, res) => {
    const { title, dueDate, questions } = req.body;
    if (!title || !dueDate || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ msg: 'Please provide title, dueDate, and at least one question' });
    }
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        course.quizzes.push({ title, dueDate, questions });
        await course.save();
        res.status(201).json(course.quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;