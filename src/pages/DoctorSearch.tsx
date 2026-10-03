import React, { useState, useEffect } from 'react';
import { Search, Filter, Stethoscope, Globe, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api.ts';
import { DoctorCard, DoctorData } from '../components/DoctorCard.tsx';
import { BookAppointmentModal } from '../components/BookAppointmentModal.tsx';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

export const DoctorSearch: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  const [bookingDoctor, setBookingDoctor] = useState<DoctorData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const specializations = [
    'All',
    'General Physician',
    'Cardiologist',
    'Pediatrician',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Dentist'
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecialization !== 'All') params.specialization = selectedSpecialization;
      if (selectedLanguage !== 'All') params.language = selectedLanguage;
      if (onlyAvailableToday) params.availableToday = 'true';

      const res = await api.get('/doctors', { params });
      if (res.data?.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, selectedLanguage, onlyAvailableToday]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleBookClick = (doc: DoctorData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingDoctor(doc);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find & Consult Multilingual Specialists
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search qualified doctors by specialization, native spoken languages, and real-time availability.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name, qualification, or symptoms..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          {/* Specialization Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-emerald-600"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Doctor Spoken Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-emerald-600"
            >
              <option value="All">All Languages (With AI Translation)</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition w-full cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailableToday}
                onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Available Today Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading verified medical specialists...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Doctors Matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clear the filters to view all available medical practitioners.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('All');
              setSelectedLanguage('All');
              setOnlyAvailableToday(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookAppointment={handleBookClick}
            />
          ))}
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoctor && (
        <BookAppointmentModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => {
            setSuccessMessage(`Appointment requested with ${bookingDoctor.name}! The doctor will review and confirm.`);
          }}
        />
      )}
    </div>
  );
};
