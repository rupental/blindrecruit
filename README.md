# BlindRecruit - CV Anonymization Platform

Profesjonalna platforma do anonimizacji CV, która pomaga eliminować nieświadome uprzedzenia w procesie rekrutacji.

## Funkcje

- Automatyczna anonimizacja CV z wykorzystaniem AI (GPT-4)
- Usuwanie danych osobowych: imię, nazwisko, adres, email, telefon, data urodzenia
- Live preview zanonimizowanego CV w panelu podglądu
- Obsługa formatów PDF i DOCX
- Privacy-first: pliki przetwarzane w pamięci, zero persistence
- Dual-panel interface z drag & drop upload
- Formularz zgód RODO
- Responsywny design dla wszystkich urządzeń

## Technologie

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 Turbo
- **File Processing**: pdf-parse, mammoth

## Wymagania

- Node.js 18+
- Konto Supabase
- Klucz API OpenAI

## Konfiguracja

1. Sklonuj repozytorium
2. Zainstaluj zależności:

```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe - skopiuj `.env.example` do `.env`:

```bash
cp .env.example .env
```

4. Uzupełnij zmienne w pliku `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. Zastosuj migracje bazy danych w Supabase (plik znajduje się w historii commitów)

## Uruchomienie

### Development

```bash
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5173`

### Production Build

```bash
npm run build
```

## Deployment na Vercel

1. Połącz projekt z Vercel
2. Skonfiguruj zmienne środowiskowe w Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. Deploy automatyczny przy każdym push do głównej gałęzi

## Struktura Projektu

```
├── api/                    # Vercel serverless functions
│   ├── anonymize.ts       # Główny endpoint anonimizacji
│   └── lib/
│       ├── aiService.ts   # Integracja z OpenAI
│       └── fileParser.ts  # Parser PDF/DOCX
├── src/
│   ├── components/        # Komponenty React
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── TryItOut.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── supabase.ts   # Klient Supabase
│   │   └── api.ts        # API helpers
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   ├── App.tsx
│   └── main.tsx
└── vercel.json           # Konfiguracja Vercel

```

## Bezpieczeństwo i Prywatność

- Żadne pliki nie są zapisywane na serwerze
- Przetwarzanie w pamięci z automatycznym czyszczeniem
- Row Level Security (RLS) w Supabase
- Brak logowania PII (Personal Identifiable Information)
- CORS zabezpieczenia
- Walidacja plików server-side

## License

© 2025 BlindRecruit. Wszelkie prawa zastrzeżone.
