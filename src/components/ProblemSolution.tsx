import { Eye, EyeOff, Shield, Users } from 'lucide-react';

export function ProblemSolution() {
  return (
    <section id="problem-solution" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
          Usuń uprzedzenia, zachowaj pełną kontrolę.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Lewa kolumna - Widok Hiring Managera */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 lg:p-12 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-900">Widok Hiring Managera</h3>
            </div>

            {/* Placeholder CV - Zanonimizowane */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-dashed border-blue-300">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center relative overflow-hidden">
                    <EyeOff className="w-10 h-10 text-slate-400" />
                    <div className="absolute inset-0 bg-slate-400/50 blur-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Kandydat #124</h4>
                    <p className="text-slate-500 text-sm">[STANOWISKO]</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <p className="text-slate-600"><strong>Kontakt:</strong> [EMAIL] | [TELEFON]</p>
                  <p className="text-slate-600"><strong>Lokalizacja:</strong> [MIASTO]</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Doświadczenie:</strong> [OPIS KOMPETENCJI - WIDOCZNE]<br />
                    <strong>Edukacja:</strong> [UCZELNIA - WIDOCZNA]<br />
                    <strong>Umiejętności:</strong> [LISTA - WIDOCZNA]
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-6 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">Decyzja bez uprzedzeń (Bias-Free)</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                Manager widzi tylko kompetencje. Zwiększasz różnorodność zespołu i spełniasz wymogi ESG.
              </p>
            </div>
          </div>

          {/* Prawa kolumna - Widok Rekrutera/HR */}
          <div className="bg-gradient-to-br from-green-50 to-slate-50 rounded-2xl p-8 lg:p-12 border border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-bold text-slate-900">Widok Rekrutera/HR</h3>
            </div>

            {/* Placeholder CV - Oryginalne */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-solid border-green-300">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    JD
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Jan Kowalski</h4>
                    <p className="text-slate-500 text-sm">Senior Developer</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <p className="text-slate-600"><strong>Kontakt:</strong> jan.kowalski@email.com | +48 123 456 789</p>
                  <p className="text-slate-600"><strong>Lokalizacja:</strong> ul. Przykładowa 1, 00-001 Warszawa</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Doświadczenie:</strong> 5+ lat w rozwoju aplikacji webowych<br />
                    <strong>Edukacja:</strong> Politechnika Warszawska, Informatyka<br />
                    <strong>Umiejętności:</strong> React, TypeScript, Node.js
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-100 rounded-lg p-6 border border-green-200">
              <h4 className="font-bold text-green-900 mb-2">Pełne bezpieczeństwo</h4>
              <p className="text-green-800 text-sm leading-relaxed">
                Wtyczka nigdy nie nadpisuje plików źródłowych. Masz zawsze dostęp do oryginału w swoim ATS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

