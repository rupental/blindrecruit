import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="border-b border-slate-200 px-8 py-6">
              <h1 className="text-2xl font-bold text-slate-900">Polityka Prywatności</h1>
            </div>

          <div className="px-8 py-8 text-slate-700 leading-relaxed space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">POLITYKA PRYWATNOŚCI BLINDRECRUIT.PL</h2>
              <p className="text-sm text-slate-600">Wersja: 1.0 Data wejścia w życie: 12.12.2025</p>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Administrator danych</h3>
              <p>Administratorem danych osobowych jest Red Sky Sp. z o.o. z siedzibą w Szczecinie, NIP: 642-26-83-651. Kontakt: hello@red-sky.com</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Zakres przetwarzanych danych</h3>
              <p>BlindRecruit w wersji Demo jest narzędziem testowym i nie przetwarza żadnych danych osobowych użytkowników w sposób trwały. Zgodnie z Regulaminem, użytkownicy mogą wgrywać wyłącznie dane fikcyjne lub syntetyczne.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Cel i podstawa przetwarzania</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Pliki wgrane do demonstracji są przetwarzane wyłącznie w pamięci operacyjnej (RAM) na czas niezbędny do wykonania operacji anonimizacji</li>
                <li>Podstawą przetwarzania jest zgoda użytkownika oraz realizacja usługi (art. 6 ust. 1 lit. a i b RODO)</li>
                <li>Dane są natychmiast usuwane po zakończeniu procesu, nie później niż w ciągu 1 godziny</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">4. Udostępnianie danych</h3>
              <p>W procesie anonimizacji dane mogą być przesyłane do zewnętrznych dostawców usług AI (np. OpenAI) działających jako podwykonawcy, wyłącznie w celu wykonania usługi.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">5. Prawa użytkownika</h3>
              <p>Ze względu na brak przechowywania danych, prawa dostępu, sprostowania czy usunięcia nie mają zastosowania. Użytkownik ma jednak prawo do:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Cofnięcia zgody w dowolnym momencie</li>
                <li>Wniesienia skargi do organu nadzorczego (UODO)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">6. Pliki cookies</h3>
              <p>Serwis może wykorzystywać pliki cookies wyłącznie w celach technicznych zapewniających prawidłowe działanie aplikacji.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">7. Bezpieczeństwo</h3>
              <p>Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo przetwarzanych danych, w tym szyfrowanie połączeń (HTTPS) oraz brak trwałego przechowywania plików.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">8. Zmiany polityki</h3>
              <p>Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. O zmianach użytkownicy zostaną poinformowani poprzez publikację nowej wersji na stronie serwisu.</p>
            </section>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
