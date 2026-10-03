import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import api from '../services/api.ts';
import { AppointmentCard, AppointmentData } from '../components/AppointmentCard.tsx';
import { PrescriptionCard, PrescriptionData } from '../components/PrescriptionCard.tsx';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Stethoscope,
  Globe,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Languages,
  Loader2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';

export const PatientDashboard: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, rxRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/prescriptions')
      ]);

      if (apptRes.data?.success) {
        setAppointments(apptRes.data.appointments || []);
      }
      if (rxRes.data?.success) {
        setPrescriptions(rxRes.data.prescriptions || []);
      }
    } catch (err) {
      console.error('Failed to load patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const upcomingAppointments = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const pastAppointments = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-semibold border border-emerald-600/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Patient Telemedicine Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed">
              Your consultation environment is configured for real-time translation and certified medical interpreter support.
            </p>
          </div>

          {/* Quick Preferred Language Selector Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs space-y-2 shrink-0">
            <div className="font-semibold text-emerald-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              Preferred Consultation Language:
            </div>
            <select
              value={currentLanguage.code}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white text-slate-900 font-bold px-3 py-2 rounded-xl text-xs shadow-xs focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-emerald-200">
              All physician messages and e-prescriptions will translate automatically into this language.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/doctors"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Find Care</div>
            <div className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition">
              Book a Specialist
            </div>
            <div className="text-xs text-slate-500">6 Specializations Available</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Appointments</div>
            <div className="font-extrabold text-slate-900 text-base">
              {upcomingAppointments.length} Active / Upcoming
            </div>
            <div className="text-xs text-slate-500">{pastAppointments.length} Past Consultations</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <Link
          to="/prescriptions"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Prescriptions</div>
            <div className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition">
              {prescriptions.length} Active Prescriptions
            </div>
            <div className="text-xs text-slate-500">Translated Instructions Available</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Upcoming Consultations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Upcoming Telemedicine Consultations
            </h2>
            <p className="text-xs text-slate-500">
              Join online video sessions when scheduled or review booking confirmation status.
            </p>
          </div>

          <Link
            to="/doctors"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            + New Appointment
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/70 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Upcoming Appointments</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any pending or confirmed doctor consultations scheduled.
            </p>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Find a Doctor Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                userRole="patient"
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Prescriptions Preview */}
      {prescriptions.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Medical Prescriptions</h2>
              <p className="text-xs text-slate-500">
                View dosages, administration schedule, and translated pharmacy instructions.
              </p>
            </div>
            <Link
              to="/prescriptions"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              View All Prescriptions ➔
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <PrescriptionCard prescription={prescriptions[0]} />
          </div>
        </div>
      )}
    </div>
  );
};
