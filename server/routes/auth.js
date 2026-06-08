const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Institute = require('../models/Institute');
const Verification = require('../models/Verification');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
  try {
    const { instituteId, password } = req.body;

    if (!instituteId || !password) {
      return res.status(400).json({ success: false, error: 'Institute/Admin ID and Password are required' });
    }

    if (instituteId === 'Admin_EduShield_HQ' && password === 'Secure!2026@Edu') {
      const userPayload = {
        id: 'Admin_EduShield_HQ',
        name: 'System Administrator',
        instituteId: 'Admin_EduShield_HQ',
        role: 'ADMIN'
      };

      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const token = jwt.sign(userPayload, secret, { expiresIn: '30d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        sameSite: 'lax'
      });

      return res.json({ success: true, role: 'ADMIN', user: userPayload });
    }

    const institute = await Institute.findOne({ instituteId });

    if (!institute) {
      return res.status(401).json({ success: false, error: 'Invalid credentials: user not found' });
    }

    const isMatch = await bcrypt.compare(password, institute.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials: password incorrect' });
    }

    const userPayload = {
      id: institute._id.toString(),
      name: institute.name,
      instituteId: institute.instituteId,
      role: 'INSTITUTE'
    };

    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const token = jwt.sign(userPayload, secret, { expiresIn: '30d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      sameSite: 'lax'
    });

    return res.json({ success: true, role: 'INSTITUTE', user: userPayload });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, error: 'An internal server error occurred during login' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authMiddleware(), (req, res) => {
  return res.json({ success: true, user: req.user });
});

router.post('/send-otp', async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({ success: false, error: 'Identifier and type are required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Verification.create({
      identifier,
      code: otp,
      type
    });

    if (identifier.includes("@")) {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: identifier,
          subject: 'EduShield - Your Verification Code',
          text: `Your EduShield verification code is: ${otp}. It will expire in 30 minutes.`
        };

        await transporter.sendMail(mailOptions);
      } else {
         console.log(`[Email Mock] Sent OTP ${otp} to ${identifier}`);
      }
    } else {
      console.log(`[SMS Mock] Sent OTP ${otp} to ${identifier}`);
    }

    const isMock = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    return res.json({ 
      success: true, 
      message: isMock ? `Mock Dev OTP: ${otp}` : "Verification code sent successfully",
      otp: isMock ? otp : undefined
    });

  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({ success: false, error: "Failed to send verification code" });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, code, type } = req.body;

    if (!identifier || !code || !type) {
      return res.status(400).json({ success: false, error: "Identifier, code, and type are required" });
    }

    const record = await Verification.findOne({ identifier, code, type });

    if (!record) {
      return res.status(400).json({ success: false, error: "Invalid or expired verification code" });
    }

    await Verification.deleteOne({ _id: record._id });

    if (type === "Password_Reset") {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const token = jwt.sign(
        { identifier }, 
        secret, 
        { expiresIn: "15m" }
      );
      return res.json({ 
        success: true, 
        message: "Verified successfully", 
        token 
      });
    }

    return res.json({ 
      success: true, 
      message: "Verified successfully" 
    });

  } catch (error) {
    console.error("OTP verify error:", error);
    return res.status(500).json({ success: false, error: "Verification failed" });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: "Token and new password required" });
    }

    let decoded;
    try {
      const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret';
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Invalid or expired password reset token" });
    }

    const { identifier } = decoded;

    const institute = await Institute.findOne({
      $or: [
        { "ownerDetails.email": identifier },
        { "ownerDetails.contact": identifier }
      ]
    });

    if (!institute) {
      return res.status(404).json({ success: false, error: "No account found matching this identifier" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    institute.password = hashedPassword;
    await institute.save();

    return res.json({ success: true, message: "Password updated successfully." });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ success: false, error: "Failed to reset password" });
  }
});

module.exports = router;
