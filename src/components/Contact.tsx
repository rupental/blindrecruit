import { Phone, Mail, User } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">
            Masz pytania o bezpieczeństwo danych?
          </h2>
          <p className="text-center text-slate-600 mb-12 text-lg">
            Porozmawiaj z Product Ownerem, nie z botem.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Wizytówka */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 lg:p-8 border border-blue-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Dominik Pogorzelski</h3>
                  <p className="text-slate-600 text-sm">Product Owner @ BlindRecruit</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Telefon</p>
                    <a
                      href="tel:+48"
                      className="text-slate-900 font-semibold hover:text-blue-600 transition-colors text-sm"
                    >
                      +48 788 773 209
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <a
                      href="mailto:"
                      className="text-slate-900 font-semibold hover:text-blue-600 transition-colors text-sm"
                    >
                      pogorzelski@red-sky.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendly Widget */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Umów 15-minutową rozmowę</h3>
              <p className="text-slate-600 mb-4 text-sm">
                Wybierz dogodny termin i porozmawiajmy o wdrożeniu BlindRecruit w Twojej firmie.
              </p>
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1 text-sm">Widget Calendly</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Osadź tutaj widget Calendly z wolnymi slotami na 15 min "Intro Call"
                  </p>
                  <a
                    href="https://calendly.com/placeholder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                  >
                    Otwórz kalendarz
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
