import { UploadCloud, Settings, Download, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const steps = [
    {
      number: '01',
      icon: UploadCloud,
      title: 'Wrzuć CV',
      description: 'Wgraj swój plik PDF lub DOCX – system automatycznie wykryje dane osobowe.',
    },
    {
      number: '02',
      icon: Settings,
      title: 'System przetwarza',
      description: 'Zaawansowany algorytm usuwa dane osobowe i zachowuje oryginalne formatowanie dokumentu.',
    },
    {
      number: '03',
      icon: Download,
      title: 'Pobierz gotową wersję',
      description: 'Odbierz gotowe zanonimizowane CV – w pełni przygotowane do przesłania rekruterowi.',
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">Jak to działa?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`relative bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="absolute top-4 right-4 text-slate-200 font-bold text-2xl">{step.number}</div>

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-500 italic mt-12">Cały proces trwa kilka sekund.</p>
      </div>
    </section>
  );
}
