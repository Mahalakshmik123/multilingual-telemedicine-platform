import React, { useState } from 'react';
import { X, Plus, Trash2, Pill, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api.ts';

interface NewPrescriptionModalProps {
  consultationId: string;
  patientId: string;
  patientName: string;
  defaultDiagnosis?: string;
  onClose: () => void;
  onSuccess: (prescription: any) => void;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  consultationId,
  patientId,
  patientName,
  defaultDiagnosis = '',
  onClose,
  onSuccess
}) => {
  const [diagnosis, setDiagnosis] = useState(defaultDiagnosis || 'Acute Viral Pharyngitis');
  const [generalAdvice, setGeneralAdvice] = useState('Drink plenty of warm fluids, rest well, and monitor temperature.');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('Avoid oily and spicy foods. Avoid cold water.');
  const [medicines, setMedicines] = useState([
    {
      name: 'Paracetamol',
      dosage: '500 mg',
      frequency: 'Twice daily after food',
      duration: '3 days',
      instructions: 'Take when fever or pain is felt.'
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '1 tablet',
        frequency: 'Once daily after food',
        duration: '5 days',
        instructions: ''
      }
    ]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    (updated[index] as any)[field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Diagnosis is required.');
      return;
    }

    const invalid = medicines.some(m => !m.name.trim());
    if (invalid) {
      setError('Please provide medicine name for all items.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/prescriptions', {
        consultationId,
        patientId,
        medicines,
        diagnosis: diagnosis.trim(),
        generalAdvice: generalAdvice.trim(),
        dietaryRestrictions: dietaryRestrictions.trim()
      });

      if (res.data?.success) {
        onSuccess(res.data.prescription);
        onClose();
      } else {
        setError(res.data?.message || 'Failed to issue prescription');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-600/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            <Pill className="w-4 h-4 text-emerald-300" />
            Electronic Prescription System
          </div>
          <h3 className="text-lg font-bold mt-1">Issue Prescription for {patientName}</h3>
          <p className="text-xs text-emerald-100">
            Dosage instructions will be automatically translated into the patient's preferred language.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Official Diagnosis */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physician Diagnosis *
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Viral Bronchitis, Type 2 Diabetes..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-emerald-600"
            />
          </div>

          {/* Medicines List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Prescribed Medicines ({medicines.length})
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-700">
                    Medicine #{idx + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Medicine Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      placeholder="e.g. Paracetamol, Amoxicillin..."
                      required
                      className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 500 mg, 10 ml..."
                      required
                      className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                      placeholder="e.g. Twice daily after meals"
                      required
                      className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      placeholder="e.g. 3 days, 1 week..."
                      required
                      className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Special Instructions</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                    placeholder="e.g. Take with warm water, avoid taking on empty stomach"
                    className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Advice & Diet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">General Advice</label>
              <textarea
                rows={2}
                value={generalAdvice}
                onChange={(e) => setGeneralAdvice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Restrictions</label>
              <textarea
                rows={2}
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Issue & Auto-Translate Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
