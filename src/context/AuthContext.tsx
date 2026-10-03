import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'interpreter' | 'admin';
  phone?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  roleDetails?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickSwitchDemo: (role: 'patient' | 'doctor' | 'interpreter' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('telemedicine_token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Profile fetch error, clearing session');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    if (res.data?.success && res.data.token) {
      const userToken = res.data.token;
      localStorage.setItem('telemedicine_token', userToken);
      setToken(userToken);
      setUser(res.data.user);
    } else {
      throw new Error(res.data?.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success && res.data.token) {
      const userToken = res.data.token;
      localStorage.setItem('telemedicine_token', userToken);
      setToken(userToken);
      setUser(res.data.user);
    } else {
      throw new Error(res.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('telemedicine_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchDemo = async (role: 'patient' | 'doctor' | 'interpreter' | 'admin') => {
    const creds: Record<string, { email: string; pass: string }> = {
      patient: { email: 'patient@example.com', pass: 'patient123' },
      doctor: { email: 'doctor@example.com', pass: 'doctor123' },
      interpreter: { email: 'interpreter@example.com', pass: 'interpreter123' },
      admin: { email: 'admin@example.com', pass: 'admin123' }
    };
    const c = creds[role];
    if (c) {
      await login(c.email, c.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        quickSwitchDemo,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
