import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AnonymizationMapping } from './aiService';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to normalize Polish characters to ASCII (fallback)
function normalizePolish(text: string): string {
  const polishMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  };
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishMap[char] || char);
}

// Interface for text position in PDF
interface TextPosition {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

// Interface for image position in PDF
interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

// Helper function to normalize text for comparison
// Dla imion/nazwisk: usuń tylko nadmiarowe spacje, zachowaj litery
// Dla telefonów/emaili: usuń wszystkie znaki specjalne
function normalizeForSearch(text: string, preserveSpaces: boolean = false): string {
  if (!text) return '';
  let normalized = text.toLowerCase().trim();
  
  if (preserveSpaces) {
    // Dla imion/nazwisk - normalizuj spacje ale je zachowaj
    normalized = normalized.replace(/\s+/g, ' ');
  } else {
    // Dla telefonów/emaili - usuń wszystkie spacje i znaki specjalne
    normalized = normalized.replace(/\s+/g, '').replace(/[^\w\d]/g, '');
  }
  
  return normalized;
}

// Helper function to find text positions in PDF using pdfjs-dist
async function findTextPositions(
  pdfBuffer: ArrayBuffer,
  mappings: AnonymizationMapping[]
): Promise<TextPosition[]> {
  const positions: TextPosition[] = [];
  
  // Kategorie, które bezwzględnie chcemy ukrywać
  const sensitiveCategories = ['name', 'email', 'phone', 'address', 'date', 'photo', 'id', 'link'];
  
  // Filtrujemy mapowania tylko do tych wrażliwych
  let targetMappings = mappings.filter(m => 
    sensitiveCategories.some(cat => m.category.toLowerCase().includes(cat)) && 
    m.original && m.original.trim().length > 1
  );

  // Rozdziel numery telefonów z "/" na osobne mappings
  const expandedMappings: AnonymizationMapping[] = [];
  targetMappings.forEach(m => {
    // Jeśli to telefon z "/" lub zaczyna się od "/", rozdziel na osobne
    if (m.category.toLowerCase().includes('phone')) {
      let originalText = m.original.trim();
      
      // Jeśli zaczyna się od "/", usuń to
      if (originalText.startsWith('/')) {
        originalText = originalText.substring(1).trim();
      }
      
      // Jeśli zawiera "/", rozdziel
      if (originalText.includes('/')) {
        const parts = originalText.split('/').map(n => n.trim()).filter(n => n.length > 0);
        parts.forEach(part => {
          // W każdej części znajdź numery telefonów (mogą być ze spacjami/myślnikami)
          const phoneNumbers = part.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{3}/g);
          if (phoneNumbers) {
            phoneNumbers.forEach(phoneNum => {
              expandedMappings.push({
                ...m,
                original: phoneNum.trim(),
              });
            });
          } else {
            // Jeśli nie znaleziono wzorca, ale część wygląda jak numer (9 cyfr)
            const digitsOnly = part.replace(/[-.\s]/g, '');
            if (digitsOnly.length >= 9) {
              expandedMappings.push({
                ...m,
                original: part,
              });
            }
          }
        });
      } else {
        // Pojedynczy numer - usuń "/" z początku jeśli jest
        expandedMappings.push({
          ...m,
          original: originalText,
        });
      }
    } else {
      expandedMappings.push(m);
    }
  });
  targetMappings = expandedMappings;
  
  console.log(`After expanding phone numbers: ${targetMappings.length} mappings`);

  try {
    // Polyfill DOMMatrix for Node.js environment
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      // Simple DOMMatrix polyfill for Node.js
      if (!global.DOMMatrix) {
        global.DOMMatrix = class DOMMatrix {
          constructor(init?: string | number[]) {
            if (typeof init === 'string') {
              // Parse matrix string
              const values = init.match(/[\d.-]+/g)?.map(Number) || [1, 0, 0, 1, 0, 0];
              this.a = values[0] || 1;
              this.b = values[1] || 0;
              this.c = values[2] || 0;
              this.d = values[3] || 1;
              this.e = values[4] || 0;
              this.f = values[5] || 0;
            } else if (Array.isArray(init)) {
              this.a = init[0] || 1;
              this.b = init[1] || 0;
              this.c = init[2] || 0;
              this.d = init[3] || 1;
              this.e = init[4] || 0;
              this.f = init[5] || 0;
            } else {
              this.a = 1;
              this.b = 0;
              this.c = 0;
              this.d = 1;
              this.e = 0;
              this.f = 0;
            }
          }
          a: number = 1;
          b: number = 0;
          c: number = 0;
          d: number = 1;
          e: number = 0;
          f: number = 0;
        } as any;
      }
    }

    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker
    if (typeof window === 'undefined') {
      try {
        const workerPath = join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
    
    // pdfBuffer jest już kopią, konwertuj na Uint8Array
    // pdfjs-dist wymaga Uint8Array i może "detach" bufor, więc używamy kopii
    const bufferData = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument({ data: bufferData }).promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Definicja regexów do "dopychania" brakujących danych (safety net)
      const patterns = [
        { regex: /[\w\.-]+@[\w\.-]+\.\w+/gi, type: 'email' }, // Email
        // Telefon PL - poprawiony regex, który znajdzie też numery po "/"
        { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/g, type: 'phone' }, // Telefon PL (bez lookbehind/lookahead dla lepszej kompatybilności)
        { regex: /\b\d{2}-\d{3}\b/g, type: 'postal' } // Kod pocztowy
      ];

      // Zbierz wszystkie elementy tekstowe z pozycjami
      const textItems: Array<{ text: string; item: any; x: number; y: number }> = [];
      textContent.items.forEach((item: any) => {
        const itemText = item.str || '';
        if (itemText.trim().length === 0) return;
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        textItems.push({
          text: itemText,
          item,
          x: transform[4],
          y: transform[5],
        });
      });

      // Dla imion/nazwisk: łącz sąsiednie elementy (PDF często dzieli na osobne elementy)
      // Tworzymy "chunks" z sąsiednich elementów
      const chunks: Array<{ text: string; items: any[]; x: number; y: number; width: number }> = [];
      const processedIndices = new Set<number>();
      
      textItems.forEach((currentItem, idx) => {
        if (processedIndices.has(idx)) return;
        
        // Sprawdź czy to może być część imienia/nazwiska (sąsiednie elementy)
        const nearbyItems = textItems.filter((other, otherIdx) => 
          !processedIndices.has(otherIdx) &&
          other !== currentItem &&
          Math.abs(other.y - currentItem.y) < 5 && // Ta sama linia (baseline)
          other.x > currentItem.x && // Po prawej stronie
          other.x < currentItem.x + 300 // W rozsądnej odległości
        );
        
        if (nearbyItems.length > 0) {
          // Połącz sąsiednie elementy
          const allItems = [currentItem, ...nearbyItems].sort((a, b) => a.x - b.x);
          const combinedText = allItems.map(i => i.text.trim()).filter(t => t).join(' ');
          const minX = Math.min(...allItems.map(i => i.x));
          const maxX = Math.max(...allItems.map(i => {
            const itemWidth = i.item.width || (i.text.length * (i.item.height || 12) * 0.6);
            return i.x + itemWidth;
          }));
          
          chunks.push({
            text: combinedText,
            items: allItems.map(i => i.item),
            x: minX,
            y: currentItem.y,
            width: maxX - minX,
          });
          
          // Oznacz jako przetworzone
          processedIndices.add(idx);
          nearbyItems.forEach(nearby => {
            const nearbyIdx = textItems.indexOf(nearby);
            if (nearbyIdx >= 0) processedIndices.add(nearbyIdx);
          });
        } else {
          // Pojedynczy element
          chunks.push({
            text: currentItem.text,
            items: [currentItem.item],
            x: currentItem.x,
            y: currentItem.y,
            width: currentItem.item.width || (currentItem.text.length * (currentItem.item.height || 12) * 0.6),
          });
          processedIndices.add(idx);
        }
      });

      // Sprawdź każdy chunk przeciwko mappings
      chunks.forEach(chunk => {
        const chunkText = chunk.text.trim();
        if (chunkText.length === 0) return;

        // --- 1. Sprawdzanie mapowań z AI ---
        targetMappings.forEach(mapping => {
          const mappingText = mapping.original.trim();
          if (mappingText.length === 0) return;

          // Dla imion/nazwisk: użyj normalizacji z zachowaniem spacji
          const isNameCategory = mapping.category.toLowerCase().includes('name');
          const normalizedChunk = normalizeForSearch(chunkText, isNameCategory);
          const normalizedMapping = normalizeForSearch(mappingText, isNameCategory);
          
          // Sprawdź dokładne dopasowanie lub zawieranie
          const exactMatch = normalizedChunk === normalizedMapping;
          const containsMatch = normalizedChunk.includes(normalizedMapping) || normalizedMapping.includes(normalizedChunk);
          
          let shouldAdd = false;
          
          if (isNameCategory && mappingText.length <= 30) {
            // Dla imion/nazwisk: sprawdź też pojedyncze słowa
            const mappingWords = mappingText.split(/\s+/).filter(w => w.length > 2);
            const chunkWords = chunkText.split(/\s+/).filter(w => w.length > 2);
            
            // Sprawdź czy którekolwiek słowo z imienia/nazwiska pasuje
            const wordMatch = mappingWords.some(mWord => 
              chunkWords.some(cWord => {
                const normM = normalizeForSearch(mWord, true);
                const normC = normalizeForSearch(cWord, true);
                return normM === normC || normC.includes(normM) || normM.includes(normC);
              })
            );
            
            shouldAdd = exactMatch || 
                       (containsMatch && Math.abs(normalizedChunk.length - normalizedMapping.length) <= 3) ||
                       wordMatch;
          } else if (mappingText.length <= 15) {
            // Dla krótkich tekstów wymagaj dokładnego dopasowania lub bardzo bliskiego
            shouldAdd = exactMatch || (containsMatch && Math.abs(normalizedChunk.length - normalizedMapping.length) <= 2);
          } else {
            // Dla dłuższych tekstów (emaile, telefony) - bardziej elastyczne dopasowanie
            shouldAdd = containsMatch;
          }
          
          if (shouldAdd) {
            chunk.items.forEach(item => {
              addPosition(positions, item, pageNum - 1, chunkText);
            });
          }
        });

        // --- 2. Sprawdzanie regexów (Safety Net) ---
        patterns.forEach(pattern => {
          const matches = chunkText.match(pattern.regex);
          if (matches) {
            // Dla telefonów: zawsze znajdź wszystkie numery osobno (nawet jeśli są po "/")
            if (pattern.type === 'phone') {
              // Znajdź wszystkie numery telefonów w tekście (również te po "/")
              // Użyj bardziej elastycznego regexa - znajdź wszystkie 9-cyfrowe ciągi
              const phoneMatches = chunkText.match(/\d{3}[-.\s\/]?\d{3}[-.\s\/]?\d{3}/g);
              if (phoneMatches) {
                phoneMatches.forEach(phoneMatch => {
                  // Jeśli match zawiera "/", rozdziel na osobne numery
                  if (phoneMatch.includes('/')) {
                    const numbers = phoneMatch.split('/').map(n => n.trim()).filter(n => {
                      // Sprawdź czy to wygląda jak numer telefonu (9 cyfr)
                      const digits = n.replace(/[-.\s]/g, '');
                      return digits.length >= 9;
                    });
                    numbers.forEach(phoneNum => {
                      // Normalizuj i znajdź w items
                      const normalizedPhone = phoneNum.replace(/[-.\s]/g, '');
                      chunk.items.forEach(item => {
                        const itemText = item.str || '';
                        const itemNormalized = itemText.replace(/[-.\s]/g, '');
                        if (itemNormalized.includes(normalizedPhone) || normalizedPhone.includes(itemNormalized.replace(/[^\d]/g, ''))) {
                          // Znajdź dokładny numer w itemText
                          const phoneInItem = itemText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{3}/);
                          if (phoneInItem) {
                            addPosition(positions, item, pageNum - 1, phoneInItem[0]);
                          }
                        }
                      });
                    });
                  } else {
                    // Pojedynczy numer - dodaj normalnie
                    chunk.items.forEach(item => {
                      const itemText = item.str || '';
                      if (itemText.includes(phoneMatch) || phoneMatch.includes(itemText)) {
                        const phoneInItem = itemText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{3}/);
                        if (phoneInItem) {
                          addPosition(positions, item, pageNum - 1, phoneInItem[0]);
                        }
                      }
                    });
                  }
                });
              }
            } else {
              // Dla innych wzorców - dodaj każdy match osobno
              matches.forEach(match => {
                chunk.items.forEach(item => {
                  if (item.str && item.str.includes(match)) {
                    addPosition(positions, item, pageNum - 1, match);
                  }
                });
              });
            }
          }
        });
      });
    }
  } catch (error) {
    console.warn('Error in findTextPositions:', error);
  }
  
  return positions;
}

// Helper function to find actual images in PDF using pdfjs-dist OperatorList
// Programowe wykrywanie obrazów - analizuje operatory PDF, nie polega na AI
async function findImagePositions(
  pdfBuffer: ArrayBuffer,
  pdfDoc: PDFDocument
): Promise<ImagePosition[]> {
  const imagePositions: ImagePosition[] = [];

  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker for Node.js
    if (typeof window === 'undefined') {
      try {
        const workerPath = join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
    
    // pdfBuffer jest już kopią ArrayBuffer, konwertuj na Uint8Array
    // pdfjs-dist wymaga Uint8Array
    const bufferData = new Uint8Array(pdfBuffer);
    
    const pdf = await pdfjsLib.getDocument({ data: bufferData }).promise;
    const numPages = pdf.numPages;
    
    // Szukaj obrazów tylko na pierwszej stronie (gdzie zwykle są zdjęcia w CV)
    if (numPages > 0) {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Pobierz listę operatorów strony
      const operatorList = await page.getOperatorList();
      
      const foundImages: Array<{ x: number; y: number; width: number; height: number }> = [];
      const matrixStack: number[][] = [[1, 0, 0, 1, 0, 0]]; // Stack dla transformacji
      
      // Stałe dla operatorów PDF (pdfjs-dist używa numerów)
      // q = 25 (save graphics state), Q = 26 (restore graphics state)
      // cm = 28 (transform matrix), Do = 31 (draw XObject/image)
      const OPS_Q = 25; // q - save graphics state
      const OPS_Q_RESTORE = 26; // Q - restore graphics state
      const OPS_CM = 28; // cm - transform matrix
      const OPS_DO = 31; // Do - draw XObject (obraz)
      
      // Przejdź przez wszystkie operatory
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const op = operatorList.fnArray[i];
        const args = operatorList.argsArray[i];
        
        // Operator 'q' - save graphics state (push current matrix)
        if (op === OPS_Q) {
          const currentMatrix = matrixStack[matrixStack.length - 1];
          matrixStack.push([...currentMatrix]);
        }
        
        // Operator 'Q' - restore graphics state (pop matrix)
        if (op === OPS_Q_RESTORE && matrixStack.length > 1) {
          matrixStack.pop();
        }
        
        // Operator 'cm' - transform matrix [a, b, c, d, e, f]
        // gdzie (e, f) to pozycja, a (a, d) to skale
        if (op === OPS_CM && args && Array.isArray(args) && args.length === 6) {
          // Mnożymy macierze (compose transformations)
          const currentMatrix = matrixStack[matrixStack.length - 1];
          const newMatrix = [
            currentMatrix[0] * args[0] + currentMatrix[2] * args[1],
            currentMatrix[1] * args[0] + currentMatrix[3] * args[1],
            currentMatrix[0] * args[2] + currentMatrix[2] * args[3],
            currentMatrix[1] * args[2] + currentMatrix[3] * args[3],
            currentMatrix[0] * args[4] + currentMatrix[2] * args[5] + currentMatrix[4],
            currentMatrix[1] * args[4] + currentMatrix[3] * args[5] + currentMatrix[5],
          ];
          matrixStack[matrixStack.length - 1] = newMatrix;
        }
        
        // Operator 'Do' - draw XObject (obraz)
        if (op === OPS_DO && args && args.length > 0) {
          const currentMatrix = matrixStack[matrixStack.length - 1];
          
          // Pozycja obrazu
          const x = currentMatrix[4];
          const y = currentMatrix[5];
          
          // Skale (szerokość i wysokość)
          const scaleX = Math.sqrt(currentMatrix[0] * currentMatrix[0] + currentMatrix[1] * currentMatrix[1]);
          const scaleY = Math.sqrt(currentMatrix[2] * currentMatrix[2] + currentMatrix[3] * currentMatrix[3]);
          
          // Szacunkowy rozmiar obrazu (używamy typowego rozmiaru 100x100 jako bazę)
          // W rzeczywistości musimy pobrać rzeczywisty rozmiar z XObject, ale to jest skomplikowane
          // Używamy skali jako przybliżenia
          const imgWidth = scaleX * 100;
          const imgHeight = scaleY * 100;
          
          // Sprawdź czy to wygląda jak zdjęcie w CV:
          // - Rozsądny rozmiar (50-250px)
          // - W górnej części strony (pierwsze 300px od góry)
          if (imgWidth > 50 && imgWidth < 300 && imgHeight > 50 && imgHeight < 300) {
            const yFromTop = viewport.height - y;
            
            if (yFromTop < 300 && yFromTop > -100) {
              // Konwersja współrzędnych: pdfjs używa top-left, pdf-lib używa bottom-left
              const pdfLibY = viewport.height - yFromTop - imgHeight;
              
              foundImages.push({
                x: Math.max(0, x - 5), // Mały padding
                y: Math.max(0, pdfLibY - 5),
                width: imgWidth + 10,
                height: imgHeight + 10,
              });
            }
          }
        }
      }
      
      // Usuń duplikaty (obrazy w bardzo podobnych miejscach - różnica < 30px)
      const uniqueImages = foundImages.filter((img, idx) => {
        return !foundImages.slice(0, idx).some(other => 
          Math.abs(other.x - img.x) < 30 && 
          Math.abs(other.y - img.y) < 30 &&
          Math.abs(other.width - img.width) < 30 &&
          Math.abs(other.height - img.height) < 30
        );
      });
      
      if (uniqueImages.length > 0) {
        console.log(`📸 Found ${uniqueImages.length} actual image(s) in PDF using OperatorList analysis`);
        uniqueImages.forEach(img => {
          imagePositions.push({
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            pageIndex: 0,
          });
        });
      } else {
        console.log('📸 No images found in PDF OperatorList - no photo to censor');
      }
    }
  } catch (error) {
    console.warn('Error analyzing PDF OperatorList for images:', error);
  }
  
  return imagePositions;
}

function addPosition(positions: TextPosition[], item: any, pageIndex: number, matchedText: string) {
  // Ignoruj znaki specjalne jak "•" (bullet points) - to nie są dane osobowe
  const trimmedText = matchedText.trim();
  if (trimmedText === '•' || trimmedText === '*' || trimmedText.length === 0) {
    return;
  }
  
  const transform = item.transform || [1, 0, 0, 1, 0, 0];
  const x = transform[4];
  const y = transform[5]; // Baseline
  const height = item.height || 12;
  // Oblicz szerokość na podstawie szerokości znaku lub długości tekstu
  const charWidth = item.width ? (item.width / (item.str || '').length) : (height * 0.6);
  const width = item.width || (matchedText.length * charWidth);

  // Sprawdź duplikaty (często pdfjs dzieli tekst na znaki, ale tutaj operujemy na stringach)
  const isDuplicate = positions.some(pos => 
    pos.pageIndex === pageIndex &&
    Math.abs(pos.x - x) < 10 &&
    Math.abs(pos.y - y) < 5 &&
    pos.text === matchedText
  );

  if (!isDuplicate) {
    positions.push({
      text: matchedText,
      x,
      y,
      width,
      height,
      pageIndex
    });
  }
}

// Helper function to load font
async function getUnicodeFont(pdfDoc: PDFDocument) {
  try {
    return await pdfDoc.embedFont(StandardFonts.Helvetica);
  } catch {
    return await pdfDoc.embedFont(StandardFonts.TimesRoman);
  }
}

export async function anonymizePDF(
  pdfBuffer: ArrayBuffer,
  mappings: AnonymizationMapping[]
): Promise<Uint8Array> {
  // KLUCZOWE: Skopiuj bufor PRZED jakimikolwiek asynchronicznymi operacjami
  // pdf-lib i pdfjs-dist mogą "detach" bufor, więc każda funkcja musi mieć swoją kopię
  // Używamy Uint8Array do skopiowania danych (bezpieczniejsze niż slice na detached buffer)
  const sourceData = new Uint8Array(pdfBuffer);
  
  // Kopiuj dane do nowych buforów dla każdej funkcji
  const bufferForPdfLib = new Uint8Array(sourceData).buffer;
  const bufferForTextAnalysis = new Uint8Array(sourceData).buffer;
  const bufferForImageAnalysis = new Uint8Array(sourceData).buffer;
  
  // Load original PDF (używa kopii)
  const pdfDoc = await PDFDocument.load(bufferForPdfLib);
  const pages = pdfDoc.getPages();

  // Log mappings from AI for debugging
  console.log('=== AI MAPPINGS DEBUG ===');
  console.log(`Total mappings received: ${mappings.length}`);
  mappings.forEach((m, idx) => {
    console.log(`${idx + 1}. "${m.original}" -> category: ${m.category}`);
  });
  console.log('========================');

  // Find sensitive data positions based ONLY on what AI detected
  // Używamy KOPII bufora (każda asynchroniczna funkcja potrzebuje własnej kopii)
  const textPositions = await findTextPositions(bufferForTextAnalysis, mappings);
  
  // Find image positions using programmatic detection (pdfjs-dist OperatorList)
  // NIE polega na AI - analizuje rzeczywistą strukturę PDF i znajduje rzeczywiste obrazy
  // Używamy KOPII bufora (każda asynchroniczna funkcja potrzebuje własnej kopii)
  const imagePositions = await findImagePositions(bufferForImageAnalysis, pdfDoc);
  
  // Debug: log found positions
  console.log(`=== PDF POSITIONS DEBUG ===`);
  console.log(`Found ${textPositions.length} text positions to censor`);
  if (textPositions.length > 0) {
    textPositions.slice(0, 10).forEach((p, idx) => {
      console.log(`${idx + 1}. "${p.text}" at page ${p.pageIndex + 1}, pos (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
    });
  } else {
    console.warn('⚠️  No text positions found in PDF!');
    console.warn('Mappings that should be found:', mappings.map(m => `"${m.original}"`).slice(0, 5));
  }
  
  if (imagePositions.length > 0) {
    console.log(`Found ${imagePositions.length} image positions to censor`);
    imagePositions.forEach((img, idx) => {
      console.log(`  Image ${idx + 1} at page ${img.pageIndex + 1}, pos (${img.x.toFixed(1)}, ${img.y.toFixed(1)})`);
    });
  }
  console.log('==========================');

  // NIE zakrywamy automatycznie żadnych obszarów - tylko to, co AI wykryło i co znaleźliśmy w PDF

  // --- 1. Zakrywanie zdjęć (jeśli AI wykryło photo) ---
  imagePositions.forEach(imgPos => {
    if (imgPos.pageIndex >= pages.length) return;
    const page = pages[imgPos.pageIndex];
    
    page.drawRectangle({
      x: imgPos.x,
      y: imgPos.y,
      width: imgPos.width,
      height: imgPos.height,
      color: rgb(1, 1, 1),
      opacity: 1,
    });
  });

  // --- 2. Zakrywanie wykrytego tekstu ---
  // Zakrywamy TYLKO to, co AI wykryło i co znaleźliśmy w PDF
  if (textPositions.length === 0 && imagePositions.length === 0) {
    console.warn('⚠️  No positions to censor - PDF will be returned unchanged');
  }

  textPositions.forEach(pos => {
    if (pos.pageIndex >= pages.length) return;
    const page = pages[pos.pageIndex];
    const { height: pageHeight } = page.getSize();
    
    // Korekta współrzędnych
    // pdf-lib rysuje od dołu do góry (y to dół prostokąta)
    // pdfjs zwraca y jako BASELINE (linię, na której stoją litery)
    // Musimy obniżyć y, aby zakryć "ogonki" liter (g, j, y) i podwyższyć wysokość, by zakryć górę liter.
    
    const descenderOffset = pos.height * 0.25; // miejsce na ogonki
    const actualHeight = pos.height * 1.4; // całkowita wysokość paska cenzury
    const actualY = pos.y - descenderOffset; 

    // Dodajemy mały margines (padding) - tylko tyle, żeby zakryć tekst
    const padding = 2;

    // Upewnij się, że nie wychodzimy poza granice strony
    const rectX = Math.max(0, pos.x - padding);
    const rectY = Math.max(0, actualY - padding);
    const rectWidth = Math.min(pos.width + (padding * 2), page.getSize().width - rectX);
    const rectHeight = Math.min(actualHeight + (padding * 2), pageHeight - rectY);

    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      color: rgb(1, 1, 1), // Biały kolor (czyszczenie)
      opacity: 1,
    });
  });

  // Zapisz PDF
  return await pdfDoc.save();
}