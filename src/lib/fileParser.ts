import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ParsedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
  };
}

export async function parseFile(file: File): Promise<ParsedDocument> {
  const mimeType = file.type;

  if (mimeType === 'application/pdf') {
    return parsePDF(file);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return parseDOCX(file);
  } else {
    throw new Error('Nieobsługiwany format pliku');
  }
}

async function parsePDF(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return {
      text: fullText.trim(),
      metadata: {
        pageCount: numPages,
        wordCount: fullText.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error) {
    console.error('Błąd parsowania PDF:', error);
    throw new Error('Nie udało się sparsować pliku PDF');
  }
}

async function parseDOCX(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error) {
    console.error('Błąd parsowania DOCX:', error);
    throw new Error('Nie udało się sparsować pliku DOCX');
  }
}
