import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Loader2, Languages, ShieldAlert } from 'lucide-react';
import api from '../services/api.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';

interface TerminologyModalProps {
  initialTerm?: string;
  onClose: () => void;
}

export const TerminologyModal: React.FC<TerminologyModalProps> = ({
  initialTerm = 'Hypertension',
  onClose
}) => {
  const { currentLanguage } = useLanguage();
  const [term, setTerm] = useState(initialTerm);
  const [targetLang, setTargetLang] = useState(currentLanguage.code);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!term.trim()) return;
    setLoading(true);
    setExplanation(null);

    try {
      const res = await api.post('/translations/explain', {
        term: term.trim(),
        targetLanguage: targetLang
      });

      if (res.data?.success) {
        setExplanation(res.data.explanation);
        setDisclaimer(res.data.disclaimer);
      }
    } catch (err: any) {
      setExplanation('Could not fetch explanation at this time. Please ask your attending doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-600/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Medical Terminology Assistant
          </div>
          <h3 className="text-lg font-bold mt-1">Simple Medical Explanations</h3>
          <p className="text-xs text-blue-100">
            Translates complex clinical jargon into patient-friendly, everyday words in your language.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medical Term or Condition:
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Hypertension, Diabetes, Electrocardiogram, Pharyngitis..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Explain in Language:
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-blue-600"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExplain}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Simple Explanation...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Explain in Simple Words
                </>
              )}
            </button>
          </div>

          {/* Result card */}
          {explanation && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Explanation for: <span className="text-blue-700">{term}</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line text-sm">
                {explanation}
              </p>

              {disclaimer && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{disclaimer}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
