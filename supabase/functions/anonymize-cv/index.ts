import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_PROMPT = `
Jesteś wyspecjalizowanym modelem AI odpowiedzialnym za anonimizację CV.
Twoim zadaniem jest:

1. Usuń WSZYSTKIE dane osobowe kandydata:
   - imię i nazwisko
   - adres zamieszkania
   - numer telefonu
   - adres e-mail
   - data urodzenia
   - narodowość, pochodzenie
   - dane rodzinne
   - status majątkowy
   - zdjęcia (wzmianki o nich)
   - linki do social media
   - numer dowodu, ID, PESEL
   - wszystkie inne elementy, które mogą zidentyfikować osobę

2. Zachowaj w 100% formatowanie dokumentu:
   - nagłówki
   - układ sekcji
   - listy punktowane i numerowane
   - odstępy, akapity, styl pisania
   - kolejność treści
   - układ CV nie może się zmienić

3. W miejsce usuniętych danych stosuj placeholdery:
   - [IMIĘ USUNIĘTO]
   - [NAZWISKO USUNIĘTO]
   - [ADRES USUNIĘTO]
   - [EMAIL USUNIĘTO]
   - [NR TELEFONU USUNIĘTO]
   - [DANE WRAŻLIWE USUNIĘTO]

4. Nie wymyślaj nowych danych.
   Nie twórz fikcyjnych informacji.
   Jeżeli coś wygląda jak dane osobowe, usuń to.

5. Nie skracaj treści.
   Nie zmieniaj kolejności sekcji.
   Nie dodawaj komentarza od siebie.

6. Zwróć jedynie oczyszczony tekst CV — nic więcej.

Format odpowiedzi:
{
  "cleanCV": "… wynik po anonimizacji …"
}
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function mockAnonymization(cvText: string): string {
  let anonymized = cvText;

  const patterns = [
    { regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, replacement: '[IMIĘ I NAZWISKO USUNIĘTO]' },
    { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/g, replacement: '[EMAIL USUNIĘTO]' },
    { regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/g, replacement: '[NR TELEFONU USUNIĘTO]' },
    { regex: /\b\d{2}-\d{3}\s+[A-Z][a-z]+\b/g, replacement: '[ADRES USUNIĘTO]' },
    { regex: /\b\d{2}\/\d{2}\/\d{4}\b/g, replacement: '[DATA URODZENIA USUNIĘTO]' },
  ];

  patterns.forEach(({ regex, replacement }) => {
    anonymized = anonymized.replace(regex, replacement);
  });

  return anonymized;
}

async function anonymizeCV(cvText: string): Promise<string> {
  if (!cvText || cvText.trim().length === 0) {
    throw new Error('Brak tekstu CV do przetworzenia.');
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured, returning mock response');
    return mockAnonymization(cvText);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Oto treść CV do anonimizacji. Zwroć wyłącznie JSON zgodnie z instrukcją.\n\nCV:\n${cvText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const json = JSON.parse(content);
    return json.cleanCV;
  } catch (error) {
    console.error('AI anonimizacja CV — błąd:', error);
    throw new Error('Nie udało się przetworzyć CV.');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const startTime = Date.now();

  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing text field' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anonymizedText = await anonymizeCV(text);
    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        anonymizedText,
        processingTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in anonymize-cv function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});