const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Institute = require('../models/Institute');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/pending-institutes', authMiddleware('ADMIN'), async (req, res) => {
  try {
    const pendingInstitutes = await Institute.find({ status: 'Pending' }).sort({ registrationDate: -1 });
    return res.json({ success: true, data: pendingInstitutes });
  } catch (error) {
    console.error('Failed to fetch pending institutes:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch pending institutes' });
  }
});

router.put('/pending-institutes', authMiddleware('ADMIN'), async (req, res) => {
  try {
    const { id, action } = req.body;

    if (!id || !['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const institute = await Institute.findById(id);

    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    if (action === 'Reject') {
      institute.status = 'Rejected';
      institute.riskStatus = 'UNSAFE';
      await institute.save();
      return res.json({ success: true, message: 'Institute rejected successfully' });
    }

    const plainPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    institute.status = 'Approved';
    institute.riskStatus = 'SAFE'; 
    institute.password = hashedPassword;
    await institute.save();

    const ownerEmail = institute.ownerDetails?.email;
    const ownerMobile = institute.ownerDetails?.contact;

    if (ownerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        subject: 'EduShield - Registration Approved',
        html: `
          <h2>Congratulations!</h2>
          <p>Your coaching institute registration for <strong>${institute.name}</strong> has been officially approved by the District Admin.</p>
          <p>Here are your secure login credentials:</p>
          <ul>
            <li><strong>Login ID:</strong> ${institute.instituteId}</li>
            <li><strong>Temporary Password:</strong> ${plainPassword}</li>
          </ul>
          <p>Please log in and change your password immediately.</p>
        `
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[Mock Email] Registration Approved for ${institute.name}. ID: ${institute.instituteId}, PASS: ${plainPassword}`);
    }

    if (ownerMobile) {
      console.log(`[Mock SMS] Sent to ${ownerMobile}: Your EduShield registration is approved. ID: ${institute.instituteId}, PASS: ${plainPassword}`);
    }

    const isMock = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    return res.json({ 
      success: true, 
      message: isMock ? `Approved! (Mock Email ID: ${institute.instituteId} | Pass: ${plainPassword})` : 'Institute approved and credentials dispatched.',
      credentials: isMock ? { id: institute.instituteId, pass: plainPassword } : undefined
    });

  } catch (error) {
    console.error('Approval/Rejection error:', error);
    return res.status(500).json({ success: false, error: 'Process failed' });
  }
});

module.exports = router;
