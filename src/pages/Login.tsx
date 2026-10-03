import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { HeartPulse, Mail, Lock, Loader2, AlertCircle, Sparkles, UserCheck, Stethoscope, Languages, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickSwitchDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (role: 'patient' | 'doctor' | 'interpreter' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await quickSwitchDemo(role);
      if (role === 'patient') navigate('/patient/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'interpreter') navigate('/interpreter');
      else navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to TeleMed Lingua
          </h2>
          <p className="text-xs text-slate-500">
            Access multilingual telemedicine consultations, e-prescriptions, and medical records.
          </p>
        </div>

        {/* Demo Accounts Quick Login Grid */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick 1-Click Demo Login:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('patient')}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 font-medium transition text-left flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Patient (Tamil)</div>
                <div className="text-[10px] text-slate-400">patient@example.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('doctor')}
              className="p-2 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 font-medium transition text-left flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Doctor (Rajesh)</div>
                <div className="text-[10px] text-slate-400">doctor@example.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('interpreter')}
              className="p-2 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 font-medium transition text-left flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Languages className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Interpreter</div>
                <div className="text-[10px] text-slate-400">interpreter@example.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="p-2 rounded-xl bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 font-medium transition text-left flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">System Admin</div>
                <div className="text-[10px] text-slate-400">admin@example.com</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
