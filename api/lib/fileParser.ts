export interface ParsedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
  };
}

export async function parseDocument(fileBuffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  if (mimeType === 'application/pdf') {
    return parsePDF(fileBuffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(fileBuffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}
