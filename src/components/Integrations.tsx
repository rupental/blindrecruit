import { Plug, Zap, Code } from 'lucide-react';

export function Integrations() {
  return (
    <section id="integrations" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
          Działamy tam, gdzie Ty rekrutujesz.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* eRecruiter */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-slate-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Plug className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">eRecruiter</h3>
            <p className="text-slate-600 leading-relaxed">
              Pełna integracja API. Działa w tle, bez klikania.
            </p>
          </div>

          {/* Recruitee */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-slate-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Recruitee</h3>
            <p className="text-slate-600 leading-relaxed">
              Dedykowany pipeline DEI. Automatyczne maskowanie.
            </p>
          </div>

          {/* API */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-slate-200">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Code className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">API</h3>
            <p className="text-slate-600 leading-relaxed">
              Możliwość podpięcia pod dowolny customowy system HR.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

