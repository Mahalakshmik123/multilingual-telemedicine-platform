import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserCheck, Stethoscope, Languages, Shield, Sparkles } from 'lucide-react';

export const DemoAccountBar: React.FC = () => {
  const { user, quickSwitchDemo } = useAuth();

  return (
    <aside aria-label="Demo Role Switcher" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Switcher:
          </span>
          <span className="text-slate-400 hidden sm:inline">
            (Current: <strong className="text-emerald-400 capitalize">{user ? `${user.role} - ${user.name}` : 'Guest'}</strong>)
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => quickSwitchDemo('patient')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'patient'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <UserCheck className="w-3 h-3 text-emerald-300" />
            Patient (Tamil)
          </button>

          <button
            onClick={() => quickSwitchDemo('doctor')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'doctor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Stethoscope className="w-3 h-3 text-blue-300" />
            Doctor (Dr. Rajesh)
          </button>

          <button
            onClick={() => quickSwitchDemo('interpreter')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'interpreter'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Languages className="w-3 h-3 text-purple-300" />
            Interpreter (Ananya)
          </button>

          <button
            onClick={() => quickSwitchDemo('admin')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Shield className="w-3 h-3 text-amber-300" />
            Admin
          </button>
        </div>
      </div>
    </aside>
  );
};
