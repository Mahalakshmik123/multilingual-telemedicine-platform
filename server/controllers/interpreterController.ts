import { Response } from 'express';
import { InterpreterRequest } from '../models/InterpreterRequest.ts';
import { Consultation } from '../models/Consultation.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const createInterpreterRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { consultationId, appointmentId, patientLanguage = 'ta', doctorLanguage = 'en', reason } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let consultation: any = null;
    if (consultationId) {
      try { consultation = await Consultation.findById(consultationId); } catch {}
      if (!consultation) consultation = await memoryStore.consultations.findById(consultationId);
    }

    const patientId = consultation ? consultation.patient : req.user.id;
    const doctorId = consultation ? consultation.doctor : req.user.id;

    const requestData = {
      consultation: consultationId || null,
      appointment: appointmentId || (consultation ? consultation.appointment : null),
      patient: patientId,
      doctor: doctorId,
      patientLanguage,
      doctorLanguage,
      status: 'pending',
      reason: reason || 'Patient and doctor require live bilingual medical interpreter assistance.',
      requestedAt: new Date()
    };

    let newReq: any = null;
    try {
      newReq = await InterpreterRequest.create(requestData);
    } catch {
      newReq = await memoryStore.interpreterRequests.create(requestData);
    }

    // Broadcast or create notification for all interpreters
    const allUsers = await memoryStore.users.find({ role: 'interpreter' });
    for (const interp of allUsers) {
      const notifData = {
        recipient: interp._id || interp.id,
        type: 'interpreter_requested',
        title: 'New Interpreter Request',
        message: `Assistance needed: ${patientLanguage.toUpperCase()} ⟷ ${doctorLanguage.toUpperCase()}`,
        link: '/interpreter'
      };
      try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }
    }

    res.status(201).json({
      success: true,
      message: 'Interpreter requested successfully. Available medical interpreters notified.',
      request: newReq
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to request interpreter', error: error.message });
  }
};

export const getInterpreterRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    let requests: any[] = [];
    try {
      requests = await InterpreterRequest.find(filter)
        .populate('patient', 'name preferredLanguage')
        .populate('doctor', 'name')
        .populate('interpreter', 'name')
        .sort({ requestedAt: -1 });
    } catch {}

    if (!requests || requests.length === 0) {
      const all = await memoryStore.interpreterRequests.find(filter);
      requests = await Promise.all(
        all.map(async r => {
          const patient = await memoryStore.users.findById(String(r.patient));
          const doctor = await memoryStore.users.findById(String(r.doctor));
          const interpreter = r.interpreter ? await memoryStore.users.findById(String(r.interpreter)) : null;
          return {
            ...r,
            patient,
            doctor,
            interpreter
          };
        })
      );
    }

    res.json({
      success: true,
      count: requests.length,
      requests: requests.map(r => ({
        id: r._id || r.id,
        requestId: `REQ-${String(r._id || r.id).slice(-6).toUpperCase()}`,
        consultationId: r.consultation,
        appointmentId: r.appointment,
        patientLanguage: r.patientLanguage,
        doctorLanguage: r.doctorLanguage,
        status: r.status,
        reason: r.reason,
        requestedAt: r.requestedAt,
        respondedAt: r.respondedAt,
        completedAt: r.completedAt,
        patient: r.patient ? { id: r.patient._id || r.patient.id, name: r.patient.name, preferredLanguage: r.patient.preferredLanguage } : null,
        doctor: r.doctor ? { id: r.doctor._id || r.doctor.id, name: r.doctor.name } : null,
        interpreter: r.interpreter ? { id: r.interpreter._id || r.interpreter.id, name: r.interpreter.name } : null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch interpreter requests', error: error.message });
  }
};

export const updateInterpreterRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'in_progress', 'completed', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const updates: any = {
      status,
      respondedAt: new Date()
    };

    if (status === 'accepted' || status === 'in_progress') {
      updates.interpreter = req.user?.id;
    }
    if (status === 'completed') {
      updates.completedAt = new Date();
    }

    let updated: any = null;
    try {
      updated = await InterpreterRequest.findByIdAndUpdate(id, { $set: updates }, { new: true });
    } catch {}

    if (!updated) {
      updated = await memoryStore.interpreterRequests.findByIdAndUpdate(id, updates);
    }

    if (!updated) {
      res.status(404).json({ success: false, message: 'Interpreter request not found' });
      return;
    }

    // If accepted, link interpreter to consultation
    if (status === 'accepted' && updated.consultation && req.user?.id) {
      try {
        await Consultation.findByIdAndUpdate(updated.consultation, { interpreter: req.user.id });
      } catch {}
      await memoryStore.consultations.findByIdAndUpdate(String(updated.consultation), { interpreter: req.user.id });

      // Notify patient and doctor
      const notifyMessage = `Certified Interpreter ${req.user.name} has accepted the request and joined the consultation session.`;
      const notifPatient = { recipient: updated.patient, type: 'interpreter_joined', title: 'Interpreter Joined', message: notifyMessage };
      const notifDoctor = { recipient: updated.doctor, type: 'interpreter_joined', title: 'Interpreter Joined', message: notifyMessage };

      try {
        await Notification.create(notifPatient);
        await Notification.create(notifDoctor);
      } catch {
        await memoryStore.notifications.create(notifPatient);
        await memoryStore.notifications.create(notifDoctor);
      }
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      request: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update interpreter request', error: error.message });
  }
};
