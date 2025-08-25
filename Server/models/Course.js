const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Submission & Homework Schemas ---
const submissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  fileUrl: String,
  submittedAt: { type: Date, default: Date.now }
});

const homeworkSchema = new Schema({
  title: String,
  description: String,
  dueDate: Date,
  submissions: [submissionSchema]
});

// --- Quiz & Question Schemas (NEW) ---
const questionSchema = new Schema({
  questionText: String,
  options: [String],
  correctAnswer: String
});

const quizSchema = new Schema({
  title: String,
  dueDate: Date,
  questions: [questionSchema]
});

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  teacher: { // <-- NEW
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{ // <-- NEW
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lectures: [{
    title: String,
    date: Date,
    notification: String,
  }],
  syllabus: {
    type: String,
    default: 'Syllabus not available yet.'
  },
  resources: [{
    name: String,
    url: String,
  }],
  quizzes: [quizSchema],      // <-- MODIFIED
  homeworks: [homeworkSchema],
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;