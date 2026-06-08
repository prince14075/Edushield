const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

router.post('/', async (req, res) => {
  try {
    const { 
      type, 
      complainantType, 
      complainantName, 
      complainantContact, 
      instituteNameText, 
      category, 
      description 
    } = req.body;

    if (!type || !complainantType || !category || !description || !instituteNameText) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const complaintId = (type === 'SUGGESTION' ? 'SUGG-' : 'COMP-') + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newComplaint = new Complaint({
      complaintId,
      type,
      complainantType,
      complainantName: complainantName || 'Anonymous',
      complainantContact,
      instituteNameText,
      category,
      description,
      status: 'PENDING'
    });

    await newComplaint.save();

    return res.status(201).json({ success: true, data: { complaintId } });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit' });
  }
});

module.exports = router;
