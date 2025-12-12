import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Download, Trash2, Loader2, X, Eye, ArrowRight, Lock } from 'lucide-react';
import { parseFile } from '../lib/fileParser';
import type { ProcessingState } from '../types';
import { Link } from 'react-router-dom';

export function TryItOut() {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [anonymizedBlob, setAnonymizedBlob] = useState<Blob | null>(null);
  const [anonymizedText, setAnonymizedText] = useState('');
  const [anonymizedFileName, setAnonymizedFileName] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > maxSize) {
      setErrorMessage('Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Nieprawidłowy format pliku. Akceptujemy tylko PDF i DOCX.');
      return;
    }

    setUploadedFile(file);
    setErrorMessage('');
    setAnonymizedBlob(null);
    setProcessingState('idle');
  };

  const handleAnonymize = async () => {
    if (!uploadedFile) return;

    setProcessingState('uploading');
    setErrorMessage('');
    setProcessingStep(0);

    try {
      // KROK 1: Wczytywanie dokumentu
      setProcessingState('parsing');
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formData = new FormData();
      formData.append('file', uploadedFile);

      // KROK 2: AI wykrywa dane RODO
      setProcessingState('anonymizing');
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch('/api/anonymize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Błąd przetwarzania' }));
        throw new Error(errorData.error || 'Błąd przetwarzania');
      }

      // KROK 3: Maskowanie danych wrażliwych
      setProcessingState('generating');
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const contentType = response.headers.get('content-type');

      // Check if response is PDF
      if (contentType?.includes('application/pdf')) {
        const pdfBlob = await response.blob();
        setAnonymizedBlob(pdfBlob);
        setAnonymizedText(''); // Clear text for PDF
        setAnonymizedFileName(
          uploadedFile.name.replace(/\.(pdf|docx)$/i, '_anonymized.pdf')
        );
        // Create preview URL for PDF
        const url = URL.createObjectURL(pdfBlob);
        setPreviewUrl(url);
      } else {
        // Handle JSON response (for DOCX)
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Nie udało się zanonimizować CV');
        }

        const textBlob = new Blob([data.anonymizedText], { type: 'text/plain' });
        setAnonymizedBlob(textBlob);
        setAnonymizedText(data.anonymizedText);
        setAnonymizedFileName(
          uploadedFile.name.replace(/\.(pdf|docx)$/i, '_anonymized.txt')
        );
        // For text files, no preview URL needed (we'll show text directly)
        setPreviewUrl(null);

        console.log(`Processing completed in ${data.processingTime}ms`);
      }

      // KROK 4: Gotowe
      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingState('complete');
    } catch (error) {
      console.error('Anonymization error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Wystąpił błąd podczas przetwarzania pliku. Spróbuj ponownie.'
      );
      setProcessingState('error');
      setProcessingStep(0);
    }
  };

  const handleDownload = () => {
    if (!anonymizedBlob || !anonymizedFileName) return;

    const url = URL.createObjectURL(anonymizedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = anonymizedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (confirm('Czy na pewno chcesz usunąć zanonimizowane dane?')) {
      // Clean up preview URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setAnonymizedBlob(null);
      setAnonymizedText('');
      setAnonymizedFileName('');
      setProcessingState('idle');
      setUploadedFile(null);
      setPreviewModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenPreview = () => {
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (anonymizedBlob) {
        e.preventDefault();
        e.returnValue = 'Masz niezapisane zanonimizowane CV. Czy na pewno chcesz opuścić stronę?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [anonymizedBlob]);

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 1:
        return 'Wczytywanie dokumentu...';
      case 2:
        return 'AI wykrywa dane RODO (Imię, Zdjęcie, Adres)...';
      case 3:
        return 'Maskowanie danych wrażliwych...';
      case 4:
        return 'Gotowe!';
      default:
        return '';
    }
  };

  return (
    <section id="try-it-out" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div>
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Przetestuj nasz silnik anonimizacji za darmo.</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Wgraj CV. Nasze AI usunie dane wrażliwe na Twoich oczach. Plik jest usuwany z serwera natychmiast po pobraniu.
          </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Upload CV</h3>

                {/* KROK 1: Zgody */}
                {!consentAccepted && (
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm text-slate-700">
                        Akceptuję{' '}
                        <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                          Regulamin
                        </Link>{' '}
                        i{' '}
                        <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                          Politykę Prywatności
                        </Link>
                        . Rozumiem, że wgrany plik zostanie przetworzony przez AI w celu demonstracji usługi, a następnie trwale usunięty.
                      </span>
                    </label>
                  </div>
                )}

                {!uploadedFile && consentAccepted ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <UploadCloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-700 font-medium mb-2">Przeciągnij plik tutaj (PDF/DOCX) lub wybierz z dysku</p>
                    <p className="text-sm text-slate-500 mb-1">Akceptowane formaty: PDF / DOCX</p>
                    <p className="text-xs text-slate-400 mb-3">Maks. 10 MB</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                      <Lock className="w-3 h-3" />
                      <span>Połączenie szyfrowane SSL. Brak zapisu w bazie danych.</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={!consentAccepted}
                    />
                  </div>
                ) : !uploadedFile ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <UploadCloud className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400">Zaznacz zgodę powyżej, aby kontynuować</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 mb-1">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </div>
                    </div>

                    {processingState === 'idle' && (
                      <button
                        onClick={handleAnonymize}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-medium"
                      >
                        Anonimizuj CV
                      </button>
                    )}

                    {['uploading', 'parsing', 'anonymizing', 'generating'].includes(processingState) && (
                      <div className="text-center py-8">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-700 font-medium mb-2 text-lg">{getProcessingMessage()}</p>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Zanonimizowane CV</h3>

                {processingState === 'complete' && anonymizedBlob ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="text-green-900 font-medium text-sm mb-1">CV zostało pomyślnie zanonimizowane</p>
                      <p className="text-xs text-green-700">{anonymizedFileName}</p>
                    </div>

                    {/* Preview section */}
                    {anonymizedText ? (
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-y-auto max-h-96">
                        <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                          {anonymizedText}
                        </pre>
                      </div>
                    ) : previewUrl ? (
                      <div className="flex-1 flex flex-col">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-2 flex-1 min-h-[300px] overflow-hidden">
                          <iframe
                            src={previewUrl}
                            className="w-full h-full border-0 rounded"
                            title="PDF Preview"
                          />
                        </div>
                        <button
                          onClick={handleOpenPreview}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Zobacz pełny podgląd
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                        <div>
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <p className="text-slate-700 font-medium mb-2">Zanonimizowany PDF jest gotowy</p>
                          <p className="text-sm text-slate-500">Kliknij "Podgląd przed pobraniem" aby zobaczyć i pobrać plik</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {!anonymizedText && previewUrl && (
                        <button
                          onClick={handleOpenPreview}
                          className="w-full bg-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          Podgląd przed pobraniem
                        </button>
                      )}
                      
                      <a
                        href="https://calendly.com/placeholder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2 text-center"
                      >
                        Podoba Ci się efekt? Wdróż wtyczkę w firmie
                        <ArrowRight className="w-5 h-5" />
                      </a>

                      <button
                        onClick={handleDelete}
                        className="w-full border-2 border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Usuń zanonimizowane dane
                      </button>

                      <p className="text-xs text-slate-500 text-center pt-2">
                        Po opuszczeniu strony wszystkie dane zostaną automatycznie usunięte.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-12 text-center min-h-[400px]">
                    <p className="text-slate-500">Zanonimizowane CV pojawi się tutaj po przetworzeniu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Podgląd zanonimizowanego CV</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Pobierz
                </button>
                <button
                  onClick={handleClosePreview}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Zamknij"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {anonymizedText ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {anonymizedText}
                  </pre>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] border border-slate-200 rounded-lg"
                  title="PDF Preview"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
