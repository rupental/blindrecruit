import { Shield, ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToTryItOut = () => {
    const element = document.getElementById('try-it-out');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="pt-32 pb-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Wdróż Blind Hiring w swoim ATS w 15 minut.
          </h1>

          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Pierwsza polska wtyczka DEI do systemów eRecruiter i Recruitee. Automatycznie anonimizujemy CV dla managerów, zachowując bezpieczny oryginał dla działu HR.
          </p>

          {/* Logotypy */}
          <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
            <div className="px-8 py-4 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center min-w-[180px] h-16">
              <img 
                src="/erecruiter.png" 
                alt="eRecruiter" 
                className="h-10 object-contain max-w-full"
              />
            </div>
            <div className="px-8 py-4 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center min-w-[180px] h-16">
              <img 
                src="/recruitee.png" 
                alt="Recruitee" 
                className="h-10 object-contain max-w-full"
              />
            </div>
            <div className="flex items-center gap-2 px-8 py-4 bg-white rounded-lg shadow-sm border border-slate-200 min-w-[180px] h-16 justify-center">
              <Shield className="w-7 h-7 text-blue-600" />
              <span className="text-slate-700 font-semibold text-lg">BlindRecruit</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={scrollToTryItOut}
              className="bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:scale-105 font-medium flex items-center gap-2"
            >
              Przetestuj Anonimizację (Bez Logowania)
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://calendly.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 text-lg px-8 py-4 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all hover:shadow-lg font-medium"
            >
              Umów rozmowę o wdrożeniu
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Zgodne z RODO. Dane nie są przechowywane.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
