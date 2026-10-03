import { Response } from 'express';
import { User } from '../models/User.ts';
import { Appointment } from '../models/Appointment.ts';
import { Consultation } from '../models/Consultation.ts';
import { MedicalTerm } from '../models/MedicalTerm.ts';
import { InterpreterRequest } from '../models/InterpreterRequest.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { SUPPORTED_LANGUAGES } from '../config/languages.ts';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allUsers = (await memoryStore.users.find()) || [];
    const totalUsers = allUsers.length;
    const totalPatients = allUsers.filter(u => u.role === 'patient').length;
    const totalDoctors = allUsers.filter(u => u.role === 'doctor').length;
    const totalInterpreters = allUsers.filter(u => u.role === 'interpreter').length;

    const allAppts = (await memoryStore.appointments.find()) || [];
    const totalAppointments = allAppts.length;
    const completedAppointments = allAppts.filter(a => a.status === 'completed').length;
    const cancelledAppointments = allAppts.filter(a => a.status === 'cancelled').length;
    const pendingAppointments = allAppts.filter(a => a.status === 'pending').length;

    const allTerms = (await memoryStore.medicalTerms.find()) || [];
    const medicalTerminologyCount = allTerms.length;

    const allRequests = (await memoryStore.interpreterRequests.find()) || [];
    const totalInterpreterRequests = allRequests.length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalInterpreters,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
        medicalTerminologyCount,
        totalInterpreterRequests
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let users = await memoryStore.users.find();

    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        status: u.status || 'active',
        preferredLanguage: u.preferredLanguage,
        createdAt: u.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    try {
      await User.findByIdAndUpdate(id, { $set: { status } });
    } catch {}
    const updated = await memoryStore.users.findByIdAndUpdate(id, { status });

    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      user: { id: updated._id || updated.id, name: updated.name, status: updated.status }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
};
