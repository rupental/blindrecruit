import { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">BlindRecruit</span>
            <span className="text-sm text-slate-500 font-normal">by RedSky</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('problem-solution')}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Dlaczego Wtyczka?
            </button>
            <button
              onClick={() => scrollToSection('problem-solution')}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Bezpieczeństwo
            </button>
            <button
              onClick={() => scrollToSection('integrations')}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Integracje
            </button>
            <a
              href="https://calendly.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium"
            >
              Umów Demo Wdrożenia
            </a>
          </div>

          <button
            className="md:hidden text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('problem-solution')}
              className="block w-full text-left text-slate-600 hover:text-slate-900 transition-colors font-medium py-2"
            >
              Dlaczego Wtyczka?
            </button>
            <button
              onClick={() => scrollToSection('problem-solution')}
              className="block w-full text-left text-slate-600 hover:text-slate-900 transition-colors font-medium py-2"
            >
              Bezpieczeństwo
            </button>
            <button
              onClick={() => scrollToSection('integrations')}
              className="block w-full text-left text-slate-600 hover:text-slate-900 transition-colors font-medium py-2"
            >
              Integracje
            </button>
            <a
              href="https://calendly.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Umów Demo Wdrożenia
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
