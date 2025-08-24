const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Course Schema
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
    url: String, // URL to the resource file (e.g., PDF, slides)
  }],
  quizzes: [{
    title: String,
    dueDate: Date,
    questions: [{
      questionText: String,
      options: [String],
      correctAnswer: String
    }]
  }],
  homeworks: [{
    title: String,
    description: String,
    dueDate: Date,
    submissions: [{
        studentId: { type: Schema.Types.ObjectId, ref: 'User' },
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now }
    }]
  }],
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
