import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">BlindRecruit</span>
              <span className="text-sm text-slate-400 font-normal">by RedSky</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Narzędzie do anonimizacji CV, które pomaga eliminować nieświadome uprzedzenia w procesie rekrutacji.
            </p>
            <p className="text-sm text-slate-500">
              Jerzego Janosika 17<br />
              Szczecin
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Szybkie linki</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#problem-solution"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Dlaczego Wtyczka?
                </a>
              </li>
              <li>
                <a
                  href="#try-it-out"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Przetestuj Anonimizację
                </a>
              </li>
              <li>
                <a
                  href="#integrations"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Integracje
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Polityki</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Regulamin Usługi Demo
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Informacja o RODO
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-400">
            © 2024 RedSky. Made with AI & ❤️ in Szczecin.
          </p>
        </div>
      </div>
    </footer>
  );
}
