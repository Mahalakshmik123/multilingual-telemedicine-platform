import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';

// Components
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { DemoAccountBar } from './components/DemoAccountBar.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

// Pages
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { DoctorSearch } from './pages/DoctorSearch.tsx';
import { PatientDashboard } from './pages/PatientDashboard.tsx';
import { DoctorDashboard } from './pages/DoctorDashboard.tsx';
import { InterpreterDashboard } from './pages/InterpreterDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { ConsultationRoom } from './pages/ConsultationRoom.tsx';
import { AppointmentsPage } from './pages/AppointmentsPage.tsx';
import { PrescriptionsPage } from './pages/PrescriptionsPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { MedicalTermsPage } from './pages/MedicalTermsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
              {/* Quick Demo Role Switcher Bar */}
              <DemoAccountBar />

              {/* Main Navigation Bar */}
              <Navbar />

              {/* App Content */}
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/doctors" element={<DoctorSearch />} />
                  <Route path="/medical-terms" element={<MedicalTermsPage />} />

                  {/* Patient Routes */}
                  <Route
                    path="/patient/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['patient', 'admin']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Routes */}
                  <Route
                    path="/doctor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Interpreter Routes */}
                  <Route
                    path="/interpreter"
                    element={
                      <ProtectedRoute allowedRoles={['interpreter', 'admin']}>
                        <InterpreterDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Real-Time Consultation Room */}
                  <Route
                    path="/consultation/:id"
                    element={
                      <ProtectedRoute allowedRoles={['patient', 'doctor', 'interpreter', 'admin']}>
                        <ConsultationRoom />
                      </ProtectedRoute>
                    }
                  />

                  {/* Common Authenticated Features */}
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute>
                        <AppointmentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prescriptions"
                    element={
                      <ProtectedRoute>
                        <PrescriptionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Professional Telemedicine Footer */}
              <Footer />
            </div>
          </SocketProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}
