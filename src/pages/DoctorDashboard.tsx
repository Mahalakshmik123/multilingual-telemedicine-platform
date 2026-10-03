import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { AppointmentCard, AppointmentData } from '../components/AppointmentCard.tsx';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  FileText,
  User,
  Settings,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.data?.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctor appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleAvailability = async () => {
    setUpdatingAvailability(true);
    try {
      const newStatus = !isAvailableToday;
      await api.put('/doctors/availability', { isAvailableToday: newStatus });
      setIsAvailableToday(newStatus);
    } catch (err: any) {
      alert('Failed to update availability status');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 text-xs font-semibold border border-blue-600/40">
            <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
            Attending Physician Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-normal">
            Real-time translation subtitle engine & clinical documentation assistant ready.
          </p>
        </div>

        {/* Availability Quick Toggle */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-4 font-semibold text-blue-100">
            <span>Today's Virtual Clinic:</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isAvailableToday ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
            }`}>
              {isAvailableToday ? 'ONLINE / ACCEPTING' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={updatingAvailability}
            className="w-full py-2 px-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition shadow-xs cursor-pointer disabled:opacity-50 text-xs"
          >
            {updatingAvailability ? 'Updating...' : isAvailableToday ? 'Set Clinic to Offline' : 'Open Clinic for Patients'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase">Pending Requests</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{pendingAppointments.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Awaiting your approval</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase">Confirmed Consults</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{confirmedAppointments.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Ready for video session</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-blue-600 uppercase">Completed Sessions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{completedAppointments.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Prescriptions logged</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-purple-600 uppercase">AI Translations</div>
          <div className="text-2xl font-black text-slate-900 mt-1">Active</div>
          <div className="text-xs text-slate-400 mt-0.5">Tamil, Hindi, Telugu +</div>
        </div>
      </div>

      {/* Pending Appointments Section */}
      {pendingAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              New Appointment Requests ({pendingAppointments.length})
            </h2>
            <span className="text-xs text-slate-500">Please review patient symptoms & language needs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                userRole="doctor"
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Scheduled Video Consultations ({confirmedAppointments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Launch video consultations with real-time translation and speech transcription.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : confirmedAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/70 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Active Consultations Waiting</h3>
            <p className="text-xs text-slate-500">
              When you accept pending appointments, they will appear here with the "Start Video Consultation" trigger.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                userRole="doctor"
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
