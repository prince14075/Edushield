const express = require('express');
const router = express.Router();
const Institute = require('../models/Institute');

router.get('/institutes', async (req, res) => {
  try {
    const pincode = req.query.pincode || '';

    const query = { status: 'Approved' };

        if (pincode.trim() !== '') {
      query['address.pincode'] = pincode;
    }

    const safeInstitutes = await Institute.find(query).select(
      'name address capacity infrastructure facilities safetyCertificates undertakings riskStatus'
    );

    return res.json({ success: true, data: safeInstitutes });
  } catch (error) {
    console.error('Failed to fetch public institutes:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
