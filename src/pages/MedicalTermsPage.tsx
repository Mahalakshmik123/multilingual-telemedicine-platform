import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { BookOpen, Search, Plus, Sparkles, Languages, Loader2, X, AlertCircle } from 'lucide-react';
import { TerminologyModal } from '../components/TerminologyModal.tsx';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';

export const MedicalTermsPage: React.FC = () => {
  const { user } = useAuth();
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  // Terminology explain modal
  const [selectedTermForExplain, setSelectedTermForExplain] = useState<string | null>(null);

  // Add Term Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState('General Medicine');
  const [newDefinition, setNewDefinition] = useState('');
  const [newSimplified, setNewSimplified] = useState('');
  const [newTranslations, setNewTranslations] = useState<Record<string, string>>({
    tamil: '',
    hindi: '',
    telugu: '',
    malayalam: '',
    kannada: '',
    english: ''
  });

  const categories = [
    'All',
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Endocrinology',
    'Gastroenterology',
    'Pulmonology',
    'Pharmacology',
    'Immunology'
  ];

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (category !== 'All') params.category = category;

      const res = await api.get('/medical-terms', { params });
      if (res.data?.success) {
        setTerms(res.data.terms || []);
      }
    } catch (err) {
      console.error('Failed to load medical terms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTerms();
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/medical-terms', {
        term: newTerm,
        category: newCategory,
        definition: newDefinition,
        simplifiedExplanation: newSimplified,
        translations: newTranslations
      });
      setShowAddModal(false);
      setNewTerm('');
      setNewDefinition('');
      setNewSimplified('');
      fetchTerms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add medical term');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            Medical Terminology & Multilingual Clinical Dictionary
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Standardized medical vocabulary across regional languages to preserve precise clinical accuracy during telemedicine consultations.
          </p>
        </div>

        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Medical Term
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[280px] flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medical term in English, Tamil, Hindi, etc..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                category === c
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading medical terms dictionary...</p>
        </div>
      ) : terms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Medical Terms Found</h3>
          <p className="text-xs text-slate-500">Try searching for terms like Fever, Hypertension, Diabetes, or Allergy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.term}</h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedTermForExplain(item.term)}
                    className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                    title="Explain in Simple Language"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.definition || 'Clinical medical description.'}
                </p>

                {/* Multilingual translations table */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Languages className="w-3 h-3 text-slate-500" />
                    Regional Translations:
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-800 text-[11px]">
                    {item.translations?.tamil && (
                      <div>
                        <span className="font-bold text-slate-500">Tamil: </span>
                        <span className="font-semibold text-emerald-900">{item.translations.tamil}</span>
                      </div>
                    )}
                    {item.translations?.hindi && (
                      <div>
                        <span className="font-bold text-slate-500">Hindi: </span>
                        <span className="font-semibold text-blue-900">{item.translations.hindi}</span>
                      </div>
                    )}
                    {item.translations?.telugu && (
                      <div>
                        <span className="font-bold text-slate-500">Telugu: </span>
                        <span className="font-semibold text-slate-900">{item.translations.telugu}</span>
                      </div>
                    )}
                    {item.translations?.malayalam && (
                      <div>
                        <span className="font-bold text-slate-500">Malayalam: </span>
                        <span className="font-semibold text-slate-900">{item.translations.malayalam}</span>
                      </div>
                    )}
                    {item.translations?.kannada && (
                      <div>
                        <span className="font-bold text-slate-500">Kannada: </span>
                        <span className="font-semibold text-slate-900">{item.translations.kannada}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTermForExplain(item.term)}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200/60 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Explain in Simple Words
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Explain Term Modal */}
      {selectedTermForExplain && (
        <TerminologyModal
          initialTerm={selectedTermForExplain}
          onClose={() => setSelectedTermForExplain(null)}
        />
      )}

      {/* Add New Medical Term Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Clinical Medical Term</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Term Name (English) *</label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="e.g. Asthma, Tachycardia..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Definition</label>
                <textarea
                  rows={2}
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Medical definition..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600">Tamil Translation</label>
                  <input
                    type="text"
                    value={newTranslations.tamil}
                    onChange={(e) => setNewTranslations({ ...newTranslations, tamil: e.target.value })}
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">Hindi Translation</label>
                  <input
                    type="text"
                    value={newTranslations.hindi}
                    onChange={(e) => setNewTranslations({ ...newTranslations, hindi: e.target.value })}
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
