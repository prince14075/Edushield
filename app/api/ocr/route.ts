import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    if (file.type === 'application/pdf') {
      try {
        // pdf-parse extracts raw text from PDF buffers
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch (err) {
        console.error("PDF parse error", err);
        return NextResponse.json({ success: false, error: 'Failed to read PDF' }, { status: 500 });
      }
    } else if (file.type.startsWith('image/')) {
      try {
        // Tesseract.js recognizes text from images
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(buffer);
        extractedText = ret.data.text;
        await worker.terminate();
      } catch (err) {
        console.error("Image parse error", err);
        return NextResponse.json({ success: false, error: 'Failed to read image' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    // Clean up excessive whitespace
    const cleanText = extractedText.replace(/\s+/g, ' ').trim();

    return NextResponse.json({
      success: true,
      text: cleanText
    });

  } catch (error: any) {
    console.error("OCR Route Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to process document' }, { status: 500 });
  }
}
