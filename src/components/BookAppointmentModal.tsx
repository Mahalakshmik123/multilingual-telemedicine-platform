import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle, Languages, Loader2 } from 'lucide-react';
import api from '../services/api.ts';
import { DoctorData } from './DoctorCard.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface BookAppointmentModalProps {
  doctor: DoctorData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  doctor,
  onClose,
  onSuccess
}) => {
  const { currentLanguage } = useLanguage();

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(doctor?.availableTimeSlots?.[0] || '10:00 AM - 10:30 AM');
  const [reason, setReason] = useState('');
  const [needsInterpreter, setNeedsInterpreter] = useState(currentLanguage.code !== 'en');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please briefly describe your symptoms or reason for the appointment.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/appointments', {
        doctorId: doctor.doctorId || doctor.id,
        date,
        timeSlot: selectedSlot,
        reason: reason.trim(),
        patientLanguage: currentLanguage.code,
        needsInterpreter
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.data?.message || 'Booking failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-600/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Book Telemedicine Consultation
          </div>
          <h2 className="text-xl font-bold mt-1">{doctor.name}</h2>
          <div className="text-xs text-emerald-100 mt-0.5">
            {doctor.specialization} • Fee: ₹{doctor.consultationFee}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Appointment Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 font-medium text-slate-800"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Available Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {(doctor.availableTimeSlots || [
                '09:00 AM - 09:30 AM',
                '10:00 AM - 10:30 AM',
                '11:00 AM - 11:30 AM',
                '02:00 PM - 02:30 PM',
                '04:00 PM - 04:30 PM'
              ]).map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for Consultation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Consultation / Symptoms
              <span className="text-slate-400 font-normal ml-1">
                (You can type in {currentLanguage.nativeName} or English)
              </span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`e.g. எனக்கு மூன்று நாட்களாக காய்ச்சல் மற்றும் தலைவலி உள்ளது...`}
              required
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Interpreter Request Checkbox */}
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/70 flex items-start gap-3">
            <input
              type="checkbox"
              id="needsInterpreter"
              checked={needsInterpreter}
              onChange={(e) => setNeedsInterpreter(e.target.checked)}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 h-4 w-4 border-slate-300"
            />
            <label htmlFor="needsInterpreter" className="text-xs text-purple-900 cursor-pointer">
              <span className="font-bold flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-purple-700" />
                Request Certified Medical Interpreter Assistance
              </span>
              <p className="text-purple-700/90 text-[11px] mt-0.5">
                A certified bilingual medical interpreter will be assigned to join your consultation alongside real-time AI translation.
              </p>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
