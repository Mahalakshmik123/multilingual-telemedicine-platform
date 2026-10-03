import React from 'react';
import { Star, Clock, Globe, Award, Calendar, CheckCircle } from 'lucide-react';
import { getLanguageByCode } from '../utils/languages.ts';

export interface DoctorData {
  id: string;
  doctorId: string;
  userId?: string;
  name: string;
  email?: string;
  avatarUrl: string;
  specialization: string;
  qualification: string;
  experience: number;
  languagesSpoken: string[];
  licenseNumber: string;
  profileDescription: string;
  consultationFee: number;
  rating: number;
  availableDays: string[];
  availableTimeSlots: string[];
  isAvailableToday: boolean;
}

interface DoctorCardProps {
  doctor: DoctorData;
  onBookAppointment: (doctor: DoctorData) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Avatar, Name, Specialization */}
        <div className="flex items-start gap-4">
          <img
            src={doctor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(doctor.name)}`}
            alt={doctor.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-emerald-700 transition">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">(Demo)</span>
              </div>
            </div>

            <div className="text-emerald-600 font-semibold text-xs mt-0.5">
              {doctor.specialization}
            </div>

            <div className="text-slate-400 text-xs mt-0.5 truncate">
              {doctor.qualification} • {doctor.experience} yrs exp
            </div>
          </div>
        </div>

        {/* Bio description */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {doctor.profileDescription || 'Experienced clinical practitioner providing comprehensive virtual consultations.'}
        </p>

        {/* Languages & Availability Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
          {/* Languages Spoken */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">Languages:</span>
            {doctor.languagesSpoken?.map(code => {
              const lang = getLanguageByCode(code);
              return (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/60 font-medium flex items-center gap-1 text-[11px]"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </span>
              );
            })}
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Available Days: {doctor.availableDays?.slice(0, 3).join(', ')}...</span>
            </div>

            {doctor.isAvailableToday ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Available Today
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Next slot tomorrow</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Fee & Book Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</div>
          <div className="text-base font-bold text-slate-900">₹{doctor.consultationFee || 500}</div>
        </div>

        <button
          onClick={() => onBookAppointment(doctor)}
          className="flex-1 max-w-[160px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Appointment
        </button>
      </div>
    </div>
  );
};
