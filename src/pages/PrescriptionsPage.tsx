import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { PrescriptionCard, PrescriptionData } from '../components/PrescriptionCard.tsx';
import { FileText, Pill, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const res = await api.get('/prescriptions');
        if (res.data?.success) {
          setPrescriptions(res.data.prescriptions || []);
        }
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Pill className="w-8 h-8 text-emerald-600" />
          Electronic Prescriptions & Medication Advice
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Access verified digital prescriptions issued by licensed attending physicians with translated dosage instructions.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading verified electronic prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Prescriptions Issued Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            After completing a video consultation, your attending doctor will issue electronic prescriptions that will appear here.
          </p>
          <Link
            to="/doctors"
            className="inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} prescription={rx} />
          ))}
        </div>
      )}
    </div>
  );
};
