import React from 'react';
import { Pill, Printer, Calendar, Stethoscope, User, ShieldCheck, Languages } from 'lucide-react';
import { getLanguageByCode } from '../utils/languages.ts';

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionData {
  id: string;
  consultationId?: string;
  medicines: MedicineItem[];
  diagnosis: string;
  generalAdvice?: string;
  dietaryRestrictions?: string;
  translatedInstructions?: {
    language: string;
    text: string;
  };
  createdAt: string;
  patient?: {
    id: string;
    name: string;
    preferredLanguage?: string;
  } | null;
  doctor?: {
    id: string;
    name: string;
    email?: string;
  } | null;
}

interface PrescriptionCardProps {
  prescription: PrescriptionData;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  const handlePrint = () => {
    window.print();
  };

  const patientLang = getLanguageByCode(prescription.patient?.preferredLanguage || 'ta');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 print:border-none print:shadow-none">
      {/* Top Prescription Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-extrabold text-xl tracking-tight">Rx</span>
            <span className="font-bold text-slate-900 text-base">Electronic Medical Prescription</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Verified Clinician
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Date: {new Date(prescription.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
            </span>
            <span>ID: #{prescription.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="print:hidden px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          Print / Save PDF
        </button>
      </div>

      {/* Doctor & Patient Metadata Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
        <div>
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Issued By</div>
          <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            {prescription.doctor?.name || 'Dr. Attending Physician'}
          </div>
          <div className="text-slate-500 mt-0.5">Licensed Medical Telemedicine Practitioner</div>
        </div>

        <div>
          <div className="text-slate-400 font-semibold uppercase text-[10px]">Patient Name</div>
          <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-600" />
            {prescription.patient?.name || 'Patient'}
          </div>
          <div className="text-slate-500 mt-0.5">Preferred Language: {patientLang.nativeName} ({patientLang.name})</div>
        </div>
      </div>

      {/* Official Doctor Diagnosis */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Diagnosis:</span>
        <div className="mt-1 font-bold text-slate-900 text-sm bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg text-emerald-950">
          {prescription.diagnosis}
        </div>
      </div>

      {/* Medicines Table */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Pill className="w-4 h-4 text-emerald-600" />
          Prescribed Medications & Dosage
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Medicine Name</th>
                <th className="py-2.5 px-3">Dosage</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Clinical Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medicines.map((med, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700">{med.dosage}</td>
                  <td className="py-2.5 px-3 text-slate-700">{med.frequency}</td>
                  <td className="py-2.5 px-3 text-slate-700">{med.duration}</td>
                  <td className="py-2.5 px-3 text-slate-600">{med.instructions || 'As advised'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Translated Instructions Highlight */}
      {prescription.translatedInstructions?.text && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-amber-700" />
            Translated Instructions ({patientLang.nativeName}):
          </div>
          <p className="text-amber-950 font-medium whitespace-pre-line leading-relaxed">
            {prescription.translatedInstructions.text}
          </p>
        </div>
      )}

      {/* General Advice & Diet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        {prescription.generalAdvice && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">General Clinical Advice:</span>
            <p className="text-slate-600 mt-0.5">{prescription.generalAdvice}</p>
          </div>
        )}

        {prescription.dietaryRestrictions && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">Dietary Restrictions:</span>
            <p className="text-slate-600 mt-0.5">{prescription.dietaryRestrictions}</p>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
        <span>Authentic e-Prescription. Non-transferable. Generated via TeleMed Lingua.</span>
        <span>Doctor Signature on File</span>
      </div>
    </div>
  );
};
