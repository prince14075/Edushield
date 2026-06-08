const express = require('express');
const router = express.Router();
const Institute = require('../models/Institute');
const Student = require('../models/Student');
const { authMiddleware } = require('../middleware/authMiddleware');

function calculateAge(dob) {
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

router.get('/list', authMiddleware('INSTITUTE'), async (req, res) => {
  try {
    const instituteIdStr = req.user.instituteId;

    const institute = await Institute.findOne({ instituteId: instituteIdStr });
    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    const students = await Student.find({ instituteId: institute._id }).sort({ createdAt: -1 });

    return res.json({ success: true, data: students });

  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
});

router.post('/register', authMiddleware('INSTITUTE'), async (req, res) => {
  try {
    const instituteIdStr = req.user.instituteId;

        const institute = await Institute.findOne({ instituteId: instituteIdStr });
    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    const { name, email, dob, qualification, course, guardianName, guardianContact, photoUrl } = req.body;

    if (!name || !email || !dob || !qualification || !course) {
      return res.status(400).json({ success: false, error: 'Missing required student details including email' });
    }

    const { currentlyEnrolled, maxAllowed } = institute.capacity || { currentlyEnrolled: 0, maxAllowed: 0 };

        if (currentlyEnrolled >= maxAllowed && maxAllowed > 0) {
      return res.status(403).json({ 
        success: false, 
        error: `Capacity Exceeded: Your maximum allowed capacity is ${maxAllowed}. You cannot enroll more students.` 
      });
    }

    const dobDate = new Date(dob);
    const age = calculateAge(dobDate);

    if (age < 16) {
      return res.status(403).json({
        success: false,
        error: 'Guidelines Violation: Student must be at least 16 years old to enroll in a coaching center.'
      });
    }

    if (qualification !== "Class X Passed" && qualification !== "Class XII Passed" && qualification !== "Graduate") {
      return res.status(403).json({
        success: false,
        error: 'Guidelines Violation: Student must have completed at least Class X to enroll.'
      });
    }

    const studentId = `STU-${Math.floor(10000 + Math.random() * 90000)}`;

    const newStudent = new Student({
      studentId,
      instituteId: institute._id,
      name,
      email,
      age,
      qualification,
      courseEnrolled: course,
      photoUrl: photoUrl || '',
      guardianDetails: {
        name: guardianName,
        contact: guardianContact
      }
    });

    await newStudent.save();

    institute.capacity.currentlyEnrolled = (institute.capacity.currentlyEnrolled || 0) + 1;
    await institute.save();

    return res.status(201).json({ success: true, data: { studentId } });

  } catch (error) {
    console.error('Student registration error:', error);
    return res.status(500).json({ success: false, error: 'Failed to enroll student' });
  }
});

module.exports = router;
