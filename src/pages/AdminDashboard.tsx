import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import {
  Shield,
  Users,
  Calendar,
  FileText,
  Languages,
  BookOpen,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  Loader2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsersList(usersRes.data.users);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setActionMessage(`User status changed to ${newStatus}`);
      fetchAdminData();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset and reseed demo database?')) return;
    setSeeding(true);
    try {
      await api.post('/seed?force=true');
      setActionMessage('Database reseeded successfully with fresh demo accounts and medical terms!');
      fetchAdminData();
    } catch (err) {
      alert('Reseed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-800/60 text-amber-200 text-xs font-semibold border border-amber-600/40">
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            System Administration & Health
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 font-normal">
            Manage registered users, doctor licenses, interpreter queues, and medical terminology.
          </p>
        </div>

        <button
          onClick={handleReseed}
          disabled={seeding}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          Reset / Reseed Demo Data
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalPatients} Patients • {stats.totalDoctors} Doctors
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase">Appointments</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalAppointments}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.completedAppointments} Completed • {stats.cancelledAppointments} Cancelled
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase">Interpreters</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalInterpreters}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalInterpreterRequests} Escalation Requests
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase">Medical Terms</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.medicalTerminologyCount}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.supportedLanguagesCount} Supported Regional Languages
            </div>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Users & Access Management</h2>
            <p className="text-xs text-slate-500">Manage account status, verify roles, and enforce security policies.</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {usersList.length} Accounts Registered
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Preferred Language</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] capitalize ${
                        u.role === 'doctor'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'patient'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'interpreter'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-slate-600">
                      {u.preferredLanguage || 'en'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                        u.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {u.status === 'active' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
