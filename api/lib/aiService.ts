const SYSTEM_PROMPT = `
Jesteś ekspertem ds. ochrony danych osobowych (RODO/GDPR) i anonimizacji dokumentów.
Twoim jedynym celem jest precyzyjne wskazanie WSZYSTKICH fraz do usunięcia z CV.

KRYTYCZNE ZASADY:
1. MUSISZ znaleźć WSZYSTKIE dane osobowe - nie możesz niczego pominąć!
2. W polu 'original' MUSI być DOKŁADNIE taki ciąg znaków jak w tekście (kopiuj-wklej, ze wszystkimi spacjami, znakami specjalnymi).
3. Każdy element danych kontaktowych MUSI być osobno w mappings (każdy telefon, każdy email).

ZIDENTYFIKUJ I ZWRÓĆ W MAPPINGS:
1. IMIĘ I NAZWISKO:
   - Pełne imię i nazwisko (np. "Maciej Kowalczyk")
   - Jeśli występuje osobno, zwróć oba (np. "Maciej" i "Kowalczyk" osobno)
   - Wszystkie wystąpienia w dokumencie

2. NUMERY TELEFONÓW:
   - Wszystkie formaty: "123456789", "123 456 789", "123-456-789", "+48 123 456 789"
   - Jeśli jest kilka numerów (np. "123456789 / 987654321"), zwróć każdy osobno
   - Zwróć DOKŁADNIE tak jak w tekście (ze spacjami, myślnikami)

3. ADRESY EMAIL:
   - Wszystkie emaile: "user@domain.com", "user.name@domain.pl"
   - Zwróć DOKŁADNIE tak jak w tekście

4. ADRESY ZAMIESZKANIA:
   - Kody pocztowe: "02-001", "00-123"
   - Miasta: "Warszawa", "Kraków"
   - Kody województw: "MZ", "MA", "DS" (jeśli występują)
   - Pełne adresy: "ul. Prosta 1, 00-001 Warszawa"
   - Każdy element osobno jeśli występuje osobno

5. DANE KONTAKTOWE W SEKCJI "KONTAKT":
   - Jeśli widzisz sekcję "KONTAKT", "CONTACT", "DANE KONTAKTOWE"
   - Wszystkie dane w tej sekcji MUSZĄ być w mappings
   - Nawet jeśli to tylko "MZ" lub krótki tekst

6. ZDJĘCIA:
   - Jeśli CV zawiera zdjęcie (nawet jeśli nie ma wzmianki w tekście), ZAWSZE zwróć category: "photo"
   - Większość CV ma zdjęcie w górnej części - jeśli widzisz strukturę typową dla CV z imieniem/nazwiskiem na górze, prawdopodobnie jest tam zdjęcie
   - Zwróć: { "original": "[PHOTO]", "replacement": "[ZDJĘCIE USUNIĘTO]", "category": "photo" }

NIE USUWAJ (to NIE są dane osobowe):
- Nazwy firm, pracodawców
- Nazwy uczelni
- Stanowiska pracy
- Umiejętności
- Opisy obowiązków

FORMAT ODPOWIEDZI - MUSI BYĆ PRAWIDŁOWY JSON:

Format odpowiedzi JSON:
{
  "cleanCV": "string",
  "mappings": [
    { "original": "Jan Kowalski", "replacement": "[IMIĘ I NAZWISKO]", "category": "name" },
    { "original": "+48 123 456 789", "replacement": "[TELEFON]", "category": "phone" },
    { "original": "123456789", "replacement": "[TELEFON]", "category": "phone" },
    { "original": "123 456 789", "replacement": "[TELEFON]", "category": "phone" },
    { "original": "jan.kowalski@gmail.com", "replacement": "[EMAIL]", "category": "email" },
    { "original": "MZ", "replacement": "[WOJEWÓDZTWO]", "category": "address" },
    { "original": "02-001", "replacement": "[KOD POCZTOWY]", "category": "address" },
    { "original": "Warszawa", "replacement": "[MIASTO]", "category": "address" }
  ]
}

PRZYKŁADY - jeśli widzisz w CV:
- "KONTAKT\nMZ\n123456789 / 987654321\nmaciej.kowalczyk@gmail.com"
  Zwróć mappings:
  [
    { "original": "MZ", "category": "address" },
    { "original": "123456789", "category": "phone" },
    { "original": "987654321", "category": "phone" },
    { "original": "maciej.kowalczyk@gmail.com", "category": "email" }
  ]

- "Maciej Kowalczyk" -> { "original": "Maciej Kowalczyk", "category": "name" }
- "tel: 500 123 456" -> { "original": "500 123 456", "category": "phone" } (bez "tel:")
`;

export interface AnonymizationMapping {
  original: string;
  replacement: string;
  category: string;
}

export interface AnonymizationResult {
  cleanCV: string;
  mappings: AnonymizationMapping[];
}

export async function anonymizeCV(cvText: string): Promise<AnonymizationResult> {
  if (!cvText || cvText.trim().length === 0) {
    throw new Error('Brak tekstu CV do przetworzenia.');
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured, returning mock response');
    return mockAnonymization(cvText);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // Używamy modelu turbo dla lepszego rozumienia kontekstu
        temperature: 0, // 0 dla maksymalnej precyzji i powtarzalności
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Przeanalizuj poniższe CV i stwórz mapę anonimizacji.\nBądź skrupulatny przy danych kontaktowych (email, telefon, adres).\n\nTREŚĆ CV:\n${cvText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parsowanie JSON z obsługą błędów
    let json;
    try {
      json = JSON.parse(content);
    } catch (e) {
      console.error("❌ Failed to parse OpenAI JSON response");
      console.error("Raw content:", content.substring(0, 500));
      throw new Error("Invalid JSON from AI");
    }

    // Walidacja odpowiedzi
    if (!json.mappings || !Array.isArray(json.mappings)) {
      console.error("❌ AI response missing mappings array");
      console.error("Response:", json);
      throw new Error("AI response missing mappings");
    }

    // Filtruj puste mappings i loguj
    const validMappings = json.mappings.filter((m: any) => 
      m.original && m.original.trim().length > 0 && m.category
    );

    console.log(`✅ AI detected ${validMappings.length} items to anonymize:`);
    validMappings.forEach((m: any, idx: number) => {
      console.log(`  ${idx + 1}. "${m.original}" -> ${m.category}`);
    });

    if (validMappings.length === 0) {
      console.warn("⚠️  WARNING: AI returned 0 mappings! This might indicate a problem.");
    }

    return {
      cleanCV: json.cleanCV || '',
      mappings: validMappings,
    };
  } catch (error) {
    console.error('AI anonimizacja CV — błąd:', error);
    throw new Error('Nie udało się przetworzyć CV.');
  }
}

function mockAnonymization(cvText: string): AnonymizationResult {
  let anonymized = cvText;
  const mappings: AnonymizationMapping[] = [];

  // Prosty mock regexowy
  const patterns = [
    { regex: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, replacement: '[EMAIL]', category: 'email' },
    { regex: /(?:\+?48)?\s?\d{3}[-\s]?\d{3}[-\s]?\d{3}/g, replacement: '[TELEFON]', category: 'phone' },
    { regex: /\d{2}-\d{3}/g, replacement: '[KOD]', category: 'address' }
  ];

  patterns.forEach(({ regex, replacement, category }) => {
    const matches = Array.from(cvText.matchAll(regex));
    matches.forEach(match => {
      mappings.push({
        original: match[0],
        replacement,
        category,
      });
      anonymized = anonymized.replace(match[0], replacement);
    });
  });

  return {
    cleanCV: anonymized,
    mappings,
  };
}

export { SYSTEM_PROMPT };