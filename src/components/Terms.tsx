import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="border-b border-slate-200 px-8 py-6">
              <h1 className="text-2xl font-bold text-slate-900">Regulamin Serwisu</h1>
            </div>

          <div className="px-8 py-8 text-slate-700 leading-relaxed space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">REGULAMIN ŚWIADCZENIA USŁUGI DROGĄ ELEKTRONICZNĄ BLINDRECRUIT.PL</h2>
              <p className="text-sm text-slate-600">Wersja: 1.0 Data wejścia w życie: 12.12.2025</p>
            </div>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 1. POSTANOWIENIA OGÓLNE</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Niniejszy Regulamin określa zasady korzystania z bezpłatnej, demonstracyjnej wersji narzędzia BlindRecruit(dalej: "Usługa" lub "Demo"), udostępnianej przez Usługodawcę.</li>
                <li>Usługodawcą jest spółka Red Sky Sp. z o.o. (lub odpowiednia forma prawna dla tego NIP) z siedzibą w Szczecinie, wpisana do rejestru przedsiębiorców, posiadająca numer NIP: 642-26-83-651 (dalej: "Usługodawca" lub "Red Sky").</li>
                <li>Kontakt z Usługodawcą możliwy jest pod adresem e-mail: hello@red-sky.com lub pisemnie na adres siedziby.</li>
                <li>Przed rozpoczęciem korzystania z Usługi, Użytkownik jest zobowiązany do zapoznania się z treścią niniejszego Regulaminu. Zaakceptowanie Regulaminu (poprzez zaznaczenie odpowiedniego checkboxa) jest warunkiem koniecznym do skorzystania z Usługi.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 2. CHARAKTER I CEL USŁUGI</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Usługa BlindRecruit w wersji Demo jest narzędziem wyłącznie poglądowym i testowym. Jej celem jest prezentacja możliwości technologicznych silnika anonimizacji opartego na Sztucznej Inteligencji (AI).</li>
                <li>Usługa Demo nie jest przeznaczona do przetwarzania rzeczywistych danych osobowych w procesach rekrutacyjnych.</li>
                <li>Usługa działa w sposób zautomatyzowany przy użyciu algorytmów AI (modele LLM), które z natury mają charakter probabilistyczny. Usługodawca nie gwarantuje 100% skuteczności anonimizacji i nie ponosi odpowiedzialności za ewentualne błędy, pominięcia lub niedokładności w przetworzonym pliku.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 3. WYMAGANIA DOTYCZĄCE DANYCH</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li><strong>Bezwzględny zakaz wprowadzania danych rzeczywistych.</strong> Użytkownik zobowiązuje się, że pliki (CV, dokumenty) wgrywane do Usługi w celu przetestowania jej działania, nie zawierają prawdziwych danych osobowych w rozumieniu art. 4 pkt 1 RODO, dotyczących żyjących osób fizycznych.</li>
                <li>Użytkownik oświadcza, że wgrywane dokumenty zawierają wyłącznie dane fikcyjne (syntetyczne) lub dane zanonimizowane w sposób uniemożliwiający identyfikację jakiejkolwiek osoby.</li>
                <li>W przypadku naruszenia przez Użytkownika postanowienia ust. 1 i wgrania do Usługi prawdziwych danych osobowych: a) Użytkownik działa jako samoistny Administrator tych danych i ponosi wyłączną odpowiedzialność za ich przetwarzanie zgodnie z RODO; b) Użytkownik oświadcza, że posiada podstawę prawną do przetwarzania tych danych; c) Użytkownik zwalnia Usługodawcę (Red Sky) z wszelkiej odpowiedzialności z tytułu naruszenia praw osób trzecich, w tym przepisów o ochronie danych osobowych.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 4. ZASADY DZIAŁANIA USŁUGI I PRZETWARZANIE PLIKÓW</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Usługa polega na: a) Wgraniu pliku przez Użytkownika (upload); b) Automatycznym przetworzeniu treści pliku przez algorytmy AI w celu ukrycia danych identyfikacyjnych; c) Udostępnieniu przetworzonego pliku do pobrania.</li>
                <li><strong>Brak archiwizacji.</strong> Usługodawca oświadcza, że pliki wgrywane przez Użytkownika w wersji Demo są przetwarzane wyłącznie w pamięci operacyjnej (RAM) na czas niezbędny do wykonania operacji i są trwale usuwane z serwerów Usługodawcy natychmiast po zakończeniu procesu (lub po pobraniu pliku), nie później niż w ciągu 1 godziny od wgrania. Usługodawca nie tworzy kopii zapasowych tych plików.</li>
                <li>Użytkownik przyjmuje do wiadomości, że w procesie anonimizacji biorą udział dostawcy technologii AI (np. OpenAI), którzy działają jako podwykonawcy Usługodawcy. Dane (zanonimizowane zgodnie z §3) mogą być przesyłane do serwerów tych dostawców wyłącznie w celu wykonania usługi.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 5. WYŁĄCZENIE ODPOWIEDZIALNOŚCI</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Usługodawca świadczy Usługę w modelu "as is" (tak jak jest) i nie udziela żadnych gwarancji, rękojmi ani zapewnień co do jej przydatności do określonego celu handlowego lub prawnego.</li>
                <li>W najszerszym zakresie dopuszczalnym przez prawo, Red Sky nie ponosi odpowiedzialności za: a) Szkody wynikłe z błędnego działania algorytmów AI (np. nieusunięcie nazwiska, usunięcie kluczowej umiejętności); b) Użycie przez Użytkownika zanonimizowanego w wersji Demo dokumentu w rzeczywistym obrocie prawnym lub rekrutacyjnym; c) Przerwy w działaniu Usługi spowodowane siłą wyższą lub awariami dostawców zewnętrznych (hosting, API AI).</li>
                <li>Odpowiedzialność Red Sky względem Użytkownika niebędącego konsumentem jest ograniczona do kwoty 100 PLN lub wyłączona w całości, jeśli przepisy na to pozwalają.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 6. PRAWA AUTORSKIE</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Oprogramowanie BlindRecruit, kod źródłowy, interfejs oraz algorytmy stanowią własność Red Sky i podlegają ochronie prawno-autorskiej.</li>
                <li>Użytkownik nie nabywa żadnych praw do oprogramowania poza licencją na jednorazowe, osobiste użycie wersji Demo w celu weryfikacji funkcjonalności.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 7. WYMAGANIA TECHNICZNE I REKLAMACJE</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Do korzystania z Usługi wymagane jest: urządzenie z dostępem do Internetu, aktualna przeglądarka internetowa (Chrome, Firefox, Safari, Edge) z obsługą JavaScript i Cookies.</li>
                <li>Reklamacje dotyczące działania Usługi można zgłaszać na adres e-mail: hello@red-sky.com. Termin rozpatrzenia reklamacji wynosi 14 dni.</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">§ 8. POSTANOWIENIA KOŃCOWE</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>Regulamin poddany jest prawu polskiemu. W sprawach nieuregulowanych mają zastosowanie przepisy Kodeksu Cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</li>
                <li>Sądem właściwym dla sporów z Użytkownikami niebędącymi konsumentami jest sąd właściwy dla siedziby Usługodawcy (Szczecin).</li>
              </ol>
            </section>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
