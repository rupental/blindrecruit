import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { parseDocument } from '../api/lib/fileParser.ts';
import { anonymizeCV } from '../api/lib/aiService.ts';
import { anonymizePDF } from '../api/lib/pdfService.ts';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.post('/api/anonymize', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file.buffer;
    const mimeType = req.file.mimetype;
    const filename = req.file.originalname;

    const parsed = await parseDocument(file, mimeType);
    
    console.log(`\n📄 Parsed document: ${parsed.metadata.wordCount} words, ${parsed.metadata.pageCount || 1} pages`);
    console.log(`📝 Text preview (first 200 chars): ${parsed.text.substring(0, 200)}...\n`);

    const result = await anonymizeCV(parsed.text);
    
    console.log(`\n✅ Anonymization complete. Mappings: ${result.mappings.length}`);
    if (result.mappings.length === 0) {
      console.warn('⚠️  WARNING: No mappings returned by AI!');
    }

    const processingTime = Date.now() - startTime;

    if (mimeType === 'application/pdf') {
      const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);

      const anonymizedPDF = await anonymizePDF(arrayBuffer, result.mappings);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="anonymized_${filename}"`);
      return res.status(200).send(Buffer.from(anonymizedPDF));
    }

    return res.status(200).json({
      success: true,
      anonymizedText: result.cleanCV,
      originalFilename: filename,
      processingTime,
      metadata: parsed.metadata,
    });
  } catch (error) {
    console.error('Error in anonymize endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/anonymize`);
});
