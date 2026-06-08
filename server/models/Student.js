const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  photoUrl: { type: String },
  qualification: { type: String, required: true },
  courseEnrolled: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  guardianDetails: {
    name: { type: String },
    contact: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
