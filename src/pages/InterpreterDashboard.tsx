import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { getLanguageByCode } from '../utils/languages.ts';
import {
  Languages,
  CheckCircle,
  XCircle,
  Video,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

export const InterpreterDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interpreter-requests');
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load interpreter requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: string, consultationId?: string) => {
    try {
      await api.put(`/interpreter-requests/${id}`, { status });
      await fetchRequests();
      if (status === 'accepted' && consultationId) {
        navigate(`/consultation/${consultationId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeRequests = requests.filter(r => ['accepted', 'in_progress'].includes(r.status));
  const completedRequests = requests.filter(r => ['completed', 'rejected'].includes(r.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/60 text-purple-200 text-xs font-semibold border border-purple-600/40">
            <Languages className="w-3.5 h-3.5 text-purple-300" />
            Certified Medical Interpreter Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Interpreter Station: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-normal">
            Facilitating human-in-the-loop medical communication across Indian regional languages and English.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-1.5 shrink-0">
          <div className="font-semibold text-purple-200">Active Status:</div>
          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            Available for Escalation Sessions
          </div>
          <div className="text-[11px] text-purple-300 mt-1">
            Certified CHI / CMI Medical Division
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-purple-600 uppercase">Incoming Escalation Requests</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{pendingRequests.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Need immediate assignment</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase">Assigned In-Progress</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeRequests.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Active consultation rooms</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-blue-600 uppercase">Completed Sessions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{completedRequests.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Logged medical records</div>
        </div>
      </div>

      {/* Pending Interpreter Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
              Live Interpreter Escalation Requests ({pendingRequests.length})
            </h2>
            <p className="text-xs text-slate-500">
              Patients or physicians requesting live bilingual interpretation assistance.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/70 text-center space-y-2">
            <Languages className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Pending Interpreter Requests</h3>
            <p className="text-xs text-slate-500">
              When a doctor or patient clicks "Request Interpreter" in a consultation room, it will instantly appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const pLang = getLanguageByCode(req.patientLanguage);
              const dLang = getLanguageByCode(req.doctorLanguage);
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-purple-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                      {req.requestId}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Language pair badges */}
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="text-lg">{pLang.flag}</span>
                      <span>{pLang.nativeName} ({pLang.name})</span>
                    </div>

                    <span className="text-purple-600">⟷</span>

                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="text-lg">{dLang.flag}</span>
                      <span>{dLang.nativeName} ({dLang.name})</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <strong>Patient:</strong> {req.patient?.name || 'Patient'}
                    </div>
                    <div>
                      <strong>Attending Doctor:</strong> {req.doctor?.name || 'Doctor'}
                    </div>
                    <div className="text-slate-500 italic mt-1">
                      "{req.reason}"
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'accepted', req.consultationId || req.appointmentId)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Join Consultation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      {activeRequests.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Active Interpretation Sessions ({activeRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    In Progress • {req.requestId}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'completed')}
                    className="text-xs font-semibold text-slate-500 hover:text-emerald-700"
                  >
                    Mark Completed
                  </button>
                </div>

                <div className="text-xs text-slate-700">
                  Assisting <strong>{req.patient?.name}</strong> with <strong>{req.doctor?.name}</strong>
                </div>

                <button
                  onClick={() => navigate(`/consultation/${req.consultationId || req.appointmentId}`)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Video className="w-4 h-4" />
                  Return to Active Consultation Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
