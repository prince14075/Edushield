const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure local disk storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const localUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      url: localUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, error: "Upload failed. Please try again." });
  }
});

module.exports = router;
