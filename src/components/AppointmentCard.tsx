import React from 'react';
import { Calendar, Clock, Video, User, Check, X, Ban, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLanguageByCode } from '../utils/languages.ts';

export interface AppointmentData {
  id: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  patientLanguage: string;
  doctorLanguage: string;
  needsInterpreter: boolean;
  notes?: string;
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    preferredLanguage?: string;
    avatarUrl?: string;
  } | null;
  doctor?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  } | null;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  userRole: 'patient' | 'doctor' | 'interpreter' | 'admin';
  onStatusUpdate?: (id: string, newStatus: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onStatusUpdate
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <Check className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Awaiting Confirmation
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <X className="w-3 h-3" /> Declined
          </span>
        );
      default:
        return null;
    }
  };

  const patientLang = getLanguageByCode(appointment.patientLanguage);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition p-5 space-y-4">
      {/* Top Header: Schedule & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{appointment.date}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{appointment.timeSlot}</span>
          </div>
        </div>

        {getStatusBadge(appointment.status)}
      </div>

      {/* Counterpart Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0 border border-slate-200">
            {userRole === 'patient' ? (
              <img
                src={appointment.doctor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(appointment.doctor?.name || 'Doctor')}`}
                alt={appointment.doctor?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={appointment.patient?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(appointment.patient?.name || 'Patient')}`}
                alt={appointment.patient?.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">
              {userRole === 'patient' ? 'Attending Doctor' : 'Patient'}
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {userRole === 'patient' ? appointment.doctor?.name : appointment.patient?.name}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Primary Language: <strong>{patientLang.nativeName} ({patientLang.name})</strong></span>
              {appointment.needsInterpreter && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">
                  Interpreter Requested
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reason for consultation */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100">
        <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
          Reason for Consultation / Symptoms:
        </div>
        <p className="text-slate-600 italic">"{appointment.reason}"</p>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
        {/* Doctor Actions */}
        {userRole === 'doctor' && appointment.status === 'pending' && onStatusUpdate && (
          <>
            <button
              onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Accept Appointment
            </button>
            <button
              onClick={() => onStatusUpdate(appointment.id, 'rejected')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </>
        )}

        {/* Patient Cancel */}
        {userRole === 'patient' && appointment.status === 'pending' && onStatusUpdate && (
          <button
            onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
            className="px-3.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs transition"
          >
            Cancel Booking
          </button>
        )}

        {/* Start / Join Consultation Button */}
        {(appointment.status === 'confirmed' || appointment.status === 'in_progress') && (
          <button
            onClick={() => navigate(`/consultation/${appointment.id}`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer animate-bounce-subtle"
          >
            <Video className="w-4 h-4 text-emerald-100" />
            {userRole === 'doctor' ? 'Start Video Consultation' : 'Join Video Consultation'}
          </button>
        )}

        {/* View Prescription if completed */}
        {appointment.status === 'completed' && (
          <button
            onClick={() => navigate(`/prescriptions`)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            View Prescription
          </button>
        )}
      </div>
    </div>
  );
};
