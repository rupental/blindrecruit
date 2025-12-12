import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSolution } from './components/ProblemSolution';
import { TryItOut } from './components/TryItOut';
import { Integrations } from './components/Integrations';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Privacy } from './components/Privacy';
import { Terms } from './components/Terms';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <TryItOut />
        <Integrations />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
