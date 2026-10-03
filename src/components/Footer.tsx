import React from 'react';
import { HeartPulse, ShieldAlert, Globe, PhoneCall } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages.ts';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      {/* Emergency Disclaimer Alert Box */}
      <div className="bg-slate-950/80 border-b border-rose-900/40 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Emergency Medical Notice:</strong> Telemedicine consultations and automated translations do not replace immediate emergency care. If experiencing severe chest pain, shortness of breath, or trauma, contact emergency medical response immediately.
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-rose-300 shrink-0">
            <PhoneCall className="w-3.5 h-3.5" />
            Emergency Services: 108 / 112 / 911
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Project Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">TeleMed Lingua</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A multilingual telemedicine platform engineered to eliminate language barriers in healthcare. Seamlessly connects patients and doctors speaking different native languages via real-time AI translation and certified human interpreter escalation.
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-emerald-400 font-medium border border-slate-700">
              College IT Final Year Capstone Project • MERN Stack Architecture
            </div>
          </div>

          {/* Column 2: Supported Languages */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              Supported Languages
            </h4>
            <ul className="space-y-1.5 text-sm">
              {SUPPORTED_LANGUAGES.map(l => (
                <li key={l.code} className="flex items-center gap-2">
                  <span>{l.flag}</span>
                  <span className="text-slate-300 font-medium">{l.nativeName}</span>
                  <span className="text-slate-500 text-xs">({l.name})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Features & System Roles */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li>• Real-Time Medical Translation</li>
              <li>• Speech-to-Text & Text-to-Speech</li>
              <li>• Live WebRTC Consultation</li>
              <li>• Human Interpreter Escalation</li>
              <li>• Medical Terminology Database</li>
              <li>• Electronic Prescriptions</li>
              <li>• AI Consultation Summaries</li>
              <li>• Automated Emergency Symptom Alert</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TeleMed Lingua. All rights reserved. Developed for academic evaluation.</p>
          <p className="text-slate-400">Built with Node.js, Express, MongoDB, React, Vite, Tailwind CSS & Google Gemini AI</p>
        </div>
      </div>
    </footer>
  );
};
