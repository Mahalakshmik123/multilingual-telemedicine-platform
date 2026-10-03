import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { History, Calendar, User, Stethoscope, FileText, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get('/consultations/history');
        if (res.data?.success) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.error('Failed to load consultation history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-8 h-8 text-emerald-600" />
          Medical Consultation Records & Clinical Summaries
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Historical records of your telemedicine consultations, physician diagnoses, and structured clinical summaries.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading consultation records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Completed Consultations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once a consultation session is completed by the doctor, its permanent records and AI documentation will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-sm text-slate-900">
                    Consultation #{record.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Completed
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {record.endedAt
                      ? new Date(record.endedAt).toLocaleDateString([], { dateStyle: 'medium' })
                      : record.appointment?.date || 'Past Session'}
                  </span>
                </div>
              </div>

              {/* Doctors & Patients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Attending Doctor</span>
                    <span className="font-bold text-slate-800">{record.doctor?.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Patient</span>
                    <span className="font-bold text-slate-800">{record.patient?.name}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis & Symptoms */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Reported Symptoms: </span>
                  <span className="text-slate-600">{record.symptoms || 'General discomfort'}</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                  <span className="font-extrabold text-emerald-950 uppercase text-[10px] block mb-0.5">
                    Doctor's Confirmed Clinical Diagnosis
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{record.diagnosis || 'Clinical Diagnosis Recorded'}</span>
                </div>

                {record.treatmentPlan && (
                  <div>
                    <span className="font-bold text-slate-700">Treatment Plan: </span>
                    <span className="text-slate-600">{record.treatmentPlan}</span>
                  </div>
                )}
              </div>

              {/* AI Summary Section if present */}
              {record.aiSummary && (
                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/80 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Structured Consultation Summary (AI Assistant)
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    <strong>Chief Complaints:</strong> {record.aiSummary.symptomsSummary}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    <strong>Observations:</strong> {record.aiSummary.observations}
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    <strong>Follow-up Advice:</strong> {record.aiSummary.followUp}
                  </div>
                  <div className="text-[10px] text-indigo-700/80 italic pt-1 border-t border-indigo-100">
                    {record.aiSummary.disclaimer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
