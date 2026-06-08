const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const buffer = file.buffer;
    let extractedText = '';

    if (file.mimetype === 'application/pdf') {
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch (err) {
        console.error("PDF parse error:", err);
        return res.status(500).json({ success: false, error: 'Failed to read PDF' });
      }
    } else if (file.mimetype.startsWith('image/')) {
      try {
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(buffer);
        extractedText = ret.data.text;
        await worker.terminate();
      } catch (err) {
        console.error("Image parse error:", err);
        return res.status(500).json({ success: false, error: 'Failed to read image' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file type' });
    }

    const cleanText = extractedText.replace(/\s+/g, ' ').trim();

    return res.json({
      success: true,
      text: cleanText
    });

  } catch (error) {
    console.error("OCR Route Error:", error);
    return res.status(500).json({ success: false, error: 'Failed to process document' });
  }
});

module.exports = router;
