import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import api from '../services/api.ts';
import {
  HeartPulse,
  Languages,
  Calendar,
  FileText,
  User,
  LogOut,
  Bell,
  Stethoscope,
  Shield,
  History,
  BookOpen,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight text-slate-900 flex items-center gap-1.5">
                TeleMed <span className="text-emerald-600 font-extrabold">Lingua</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  AI Translation
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Multilingual Telemedicine Platform
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/doctors"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/doctors' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('findDoctor')}
                </Link>
                <Link
                  to="/medical-terms"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/medical-terms' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('medicalTerms')}
                </Link>
              </>
            ) : user?.role === 'patient' ? (
              <>
                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/patient/dashboard' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/doctors"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/doctors' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('findDoctor')}
                </Link>
                <Link
                  to="/appointments"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/appointments' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('appointments')}
                </Link>
                <Link
                  to="/prescriptions"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/prescriptions' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('prescriptions')}
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/history' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/medical-terms"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/medical-terms' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('medicalTerms')}
                </Link>
              </>
            ) : user?.role === 'doctor' ? (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/doctor/dashboard' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Doctor Dashboard
                </Link>
                <Link
                  to="/appointments"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/appointments' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Schedule
                </Link>
                <Link
                  to="/prescriptions"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/prescriptions' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Prescriptions
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/history' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Consultation Logs
                </Link>
                <Link
                  to="/medical-terms"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/medical-terms' ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Terminology
                </Link>
              </>
            ) : user?.role === 'interpreter' ? (
              <>
                <Link
                  to="/interpreter"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/interpreter' ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Interpreter Station
                </Link>
                <Link
                  to="/medical-terms"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/medical-terms' ? 'text-purple-700 bg-purple-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Glossary
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/admin' ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Console
                </Link>
                <Link
                  to="/medical-terms"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/medical-terms' ? 'text-amber-700 bg-amber-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Medical Terms
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition ${
                              n.read ? 'bg-white opacity-75' : 'bg-emerald-50/50'
                            }`}
                          >
                            <div className="font-semibold text-slate-800 mb-0.5">{n.title}</div>
                            <div className="text-slate-600">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition group"
                  title="My Profile"
                >
                  <img
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <div className="font-semibold text-slate-800 leading-tight">{user?.name}</div>
                    <div className="text-[10px] font-medium text-emerald-600 capitalize">{user?.role}</div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {isAuthenticated ? (
            <>
              {user?.role === 'patient' && (
                <>
                  <Link to="/patient/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('dashboard')}</Link>
                  <Link to="/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('findDoctor')}</Link>
                  <Link to="/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('appointments')}</Link>
                  <Link to="/prescriptions" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('prescriptions')}</Link>
                  <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">History</Link>
                  <Link to="/medical-terms" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('medicalTerms')}</Link>
                </>
              )}
              {user?.role === 'doctor' && (
                <>
                  <Link to="/doctor/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
                  <Link to="/appointments" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Appointments</Link>
                  <Link to="/prescriptions" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Prescriptions</Link>
                  <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Consultations</Link>
                </>
              )}
              {user?.role === 'interpreter' && (
                <Link to="/interpreter" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Interpreter Station</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Admin Console</Link>
              )}
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">My Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('findDoctor')}</Link>
              <Link to="/medical-terms" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">{t('medicalTerms')}</Link>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50">Sign In</Link>
              <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Create Account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
