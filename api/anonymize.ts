import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseDocument } from './lib/fileParser';
import { anonymizeCV } from './lib/aiService';
import { anonymizePDF } from './lib/pdfService';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(req: VercelRequest): Promise<{ file: Buffer; mimeType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type']?.split('boundary=')[1];

        if (!boundary) {
          return reject(new Error('No boundary found'));
        }

        const parts = buffer.toString('binary').split(`--${boundary}`);

        for (const part of parts) {
          if (part.includes('filename=')) {
            const filenameMatch = part.match(/filename="(.+?)"/);
            const contentTypeMatch = part.match(/Content-Type: (.+?)\r\n/);

            if (filenameMatch && contentTypeMatch) {
              const filename = filenameMatch[1];
              const mimeType = contentTypeMatch[1];

              const fileDataStart = part.indexOf('\r\n\r\n') + 4;
              const fileDataEnd = part.lastIndexOf('\r\n');
              const fileData = part.substring(fileDataStart, fileDataEnd);

              const fileBuffer = Buffer.from(fileData, 'binary');

              return resolve({ file: fileBuffer, mimeType, filename });
            }
          }
        }

        reject(new Error('No file found in request'));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const startTime = Date.now();

  try {
    const { file, mimeType, filename } = await parseFormData(req);

    // Parse document to extract text
    const parsed = await parseDocument(file, mimeType);

    // Get anonymization mappings from AI
    const result = await anonymizeCV(parsed.text);

    const processingTime = Date.now() - startTime;

    // If PDF, return anonymized PDF file
    if (mimeType === 'application/pdf') {
      // Convert Buffer to ArrayBuffer
      const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);

      const anonymizedPDF = await anonymizePDF(
        arrayBuffer,
        result.mappings
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="anonymized_${filename}"`);
      return res.status(200).send(Buffer.from(anonymizedPDF));
    }

    // Otherwise return text response
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
}
