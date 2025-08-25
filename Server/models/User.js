const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: { // <-- MODIFIED
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;