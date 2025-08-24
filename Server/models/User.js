const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true // Removes whitespace from both ends of a string
  },
  password: {
    type: String,
    required: true
  },
  // Reference to the courses the student is enrolled in
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course' // This creates a reference to the Course model
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
