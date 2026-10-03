import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';
import { HeartPulse, User, Mail, Lock, Phone, Stethoscope, Languages, AlertCircle, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'patient' | 'doctor' | 'interpreter'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('ta');

  // Patient Fields
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experience, setExperience] = useState('5');
  const [licenseNumber, setLicenseNumber] = useState('MED-TN-99881');
  const [doctorLanguages, setDoctorLanguages] = useState<string[]>(['en', 'ta']);

  // Interpreter Fields
  const [interpreterLanguages, setInterpreterLanguages] = useState<string[]>(['ta', 'en', 'hi']);
  const [interpreterQualification, setInterpreterQualification] = useState('Certified Medical Interpreter (CMI)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      name,
      email,
      password,
      role,
      phone,
      preferredLanguage
    };

    if (role === 'patient') {
      payload.age = Number(age);
      payload.gender = gender;
    } else if (role === 'doctor') {
      payload.specialization = specialization;
      payload.qualification = qualification;
      payload.experience = Number(experience);
      payload.licenseNumber = licenseNumber;
      payload.languagesSpoken = doctorLanguages;
    } else if (role === 'interpreter') {
      payload.languages = interpreterLanguages;
      payload.qualification = interpreterQualification;
    }

    try {
      await register(payload);
      if (role === 'patient') navigate('/patient/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/interpreter');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (code: string, currentList: string[], setList: (v: string[]) => void) => {
    if (currentList.includes(code)) {
      if (currentList.length > 1) {
        setList(currentList.filter(c => c !== code));
      }
    } else {
      setList([...currentList, code]);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create TeleMed Lingua Account
          </h2>
          <p className="text-xs text-slate-500">
            Select your role to start consulting with real-time translation support.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'patient'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            Patient
          </button>

          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'doctor'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            Doctor
          </button>

          <button
            type="button"
            onClick={() => setRole('interpreter')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'interpreter'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-purple-600" />
            Interpreter
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'doctor' ? 'Dr. First Last' : 'First Last'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>
          </div>

          {/* Role: Patient Fields */}
          {role === 'patient' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="font-bold text-emerald-900">Patient Profile Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-emerald-800"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Role: Doctor Fields */}
          {role === 'doctor' && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="font-bold text-blue-900">Doctor Credentials & Qualifications</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Dentist">Dentist</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD, DM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medical License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MCI-TN-45892"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Languages Spoken:</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => toggleLanguage(l.code, doctorLanguages, setDoctorLanguages)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        doctorLanguages.includes(l.code)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Role: Interpreter Fields */}
          {role === 'interpreter' && (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
              <div className="font-bold text-purple-900">Interpreter Certification & Languages</div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certification & Qualifications</label>
                <input
                  type="text"
                  value={interpreterQualification}
                  onChange={(e) => setInterpreterQualification(e.target.value)}
                  placeholder="e.g. Certified Medical Interpreter (CMI), CHI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certified Languages:</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => toggleLanguage(l.code, interpreterLanguages, setInterpreterLanguages)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        interpreterLanguages.includes(l.code)
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {l.flag} {l.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Register Account
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
