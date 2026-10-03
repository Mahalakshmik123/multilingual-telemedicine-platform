import { Response } from 'express';
import { Appointment } from '../models/Appointment.ts';
import { Doctor } from '../models/Doctor.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';
import { Consultation } from '../models/Consultation.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      res.status(403).json({ success: false, message: 'Only patients can book appointments' });
      return;
    }

    const { doctorId, date, timeSlot, reason, patientLanguage = 'ta', needsInterpreter = false } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      res.status(400).json({ success: false, message: 'Missing required appointment fields' });
      return;
    }

    // Resolve doctor's user ID if doctorId passed is doctor profile ID
    let doctorUserId = doctorId;
    let doctorProfile = await memoryStore.doctors.findById(doctorId);
    if (!doctorProfile) {
      try { doctorProfile = await Doctor.findById(doctorId); } catch {}
    }
    if (doctorProfile) {
      doctorUserId = String(doctorProfile.user);
    }

    // Prevent double booking for the same doctor/date/timeSlot
    let existing: any = null;
    try {
      existing = await Appointment.findOne({
        doctor: doctorUserId,
        date,
        timeSlot,
        status: { $in: ['pending', 'confirmed'] }
      });
    } catch {}

    if (!existing) {
      const allAppts = await memoryStore.appointments.find();
      existing = allAppts.find(
        a =>
          String(a.doctor) === String(doctorUserId) &&
          a.date === date &&
          a.timeSlot === timeSlot &&
          ['pending', 'confirmed'].includes(a.status)
      );
    }

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This doctor is already booked for the selected date and time slot. Please choose another slot.'
      });
      return;
    }

    const apptData = {
      patient: req.user.id,
      doctor: doctorUserId,
      date,
      timeSlot,
      reason,
      status: 'pending',
      patientLanguage: patientLanguage || req.user.preferredLanguage || 'ta',
      doctorLanguage: 'en',
      needsInterpreter: Boolean(needsInterpreter),
      notes: ''
    };

    let appointment: any = null;
    try {
      appointment = await Appointment.create(apptData);
    } catch {
      appointment = await memoryStore.appointments.create(apptData);
    }

    // Create notification for Doctor
    const notifData = {
      recipient: doctorUserId,
      type: 'appointment_booked',
      title: 'New Appointment Booking',
      message: `${req.user.name} booked an appointment for ${date} at ${timeSlot}. Reason: ${reason}`,
      link: `/appointments`
    };
    try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Waiting for doctor confirmation.',
      appointment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: error.message });
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { status, date } = req.query;
    const filter: any = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } else if (req.user.role !== 'admin') {
      // Interpreters can view if needs interpreter
      filter.needsInterpreter = true;
    }

    if (status) filter.status = status;
    if (date) filter.date = date;

    let appointments: any[] = [];
    try {
      appointments = await Appointment.find(filter)
        .populate('patient', 'name email phone preferredLanguage avatarUrl')
        .populate('doctor', 'name email phone avatarUrl')
        .sort({ date: 1, timeSlot: 1 });
    } catch {}

    if (!appointments || appointments.length === 0) {
      const all = await memoryStore.appointments.find(filter);
      appointments = await Promise.all(
        all.map(async appt => {
          const patient = await memoryStore.users.findById(String(appt.patient));
          const doctor = await memoryStore.users.findById(String(appt.doctor));
          return {
            ...appt,
            patient,
            doctor
          };
        })
      );
    }

    res.json({
      success: true,
      count: appointments.length,
      appointments: appointments.map(a => ({
        id: a._id || a.id,
        date: a.date,
        timeSlot: a.timeSlot,
        reason: a.reason,
        status: a.status,
        patientLanguage: a.patientLanguage,
        doctorLanguage: a.doctorLanguage,
        needsInterpreter: a.needsInterpreter,
        notes: a.notes,
        rejectionReason: a.rejectionReason,
        patient: a.patient
          ? {
              id: a.patient._id || a.patient.id,
              name: a.patient.name,
              email: a.patient.email,
              phone: a.patient.phone,
              preferredLanguage: a.patient.preferredLanguage,
              avatarUrl: a.patient.avatarUrl
            }
          : null,
        doctor: a.doctor
          ? {
              id: a.doctor._id || a.doctor.id,
              name: a.doctor.name,
              email: a.doctor.email,
              avatarUrl: a.doctor.avatarUrl
            }
          : null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
  }
};

export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid appointment status' });
      return;
    }

    let appointment: any = null;
    try {
      appointment = await Appointment.findById(id);
    } catch {}
    if (!appointment) {
      appointment = await memoryStore.appointments.findById(id);
    }

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Role check: Only attending doctor or patient or admin can update
    const userId = req.user?.id;
    const isDoctor = String(appointment.doctor) === String(userId);
    const isPatient = String(appointment.patient) === String(userId);
    const isAdmin = req.user?.role === 'admin';

    if (!isDoctor && !isPatient && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
      return;
    }

    // Patients can only cancel their own appointments
    if (isPatient && !isDoctor && !isAdmin && status !== 'cancelled') {
      res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      return;
    }

    const updatePayload: any = { status };
    if (notes) updatePayload.notes = notes;
    if (rejectionReason) updatePayload.rejectionReason = rejectionReason;

    try {
      appointment = await Appointment.findByIdAndUpdate(id, { $set: updatePayload }, { new: true });
    } catch {}
    appointment = await memoryStore.appointments.findByIdAndUpdate(id, updatePayload);

    // If confirmed by doctor, ensure a consultation room is prepared
    if (status === 'confirmed') {
      const consultData = {
        appointment: appointment._id || appointment.id,
        patient: appointment.patient,
        doctor: appointment.doctor,
        status: 'scheduled',
        symptoms: appointment.reason,
        emergencyAlertTriggered: false
      };
      try {
        await Consultation.create(consultData);
      } catch {
        await memoryStore.consultations.create(consultData);
      }

      // Notify patient
      const notifData = {
        recipient: appointment.patient,
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        message: `Your appointment on ${appointment.date} at ${appointment.timeSlot} has been confirmed.`,
        link: `/consultations`
      };
      try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }
    } else if (status === 'rejected') {
      const notifData = {
        recipient: appointment.patient,
        type: 'appointment_rejected',
        title: 'Appointment Rejected',
        message: `Your appointment request was rejected. Reason: ${rejectionReason || 'Doctor unavailable'}`,
        link: `/appointments`
      };
      try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }
    } else if (status === 'cancelled') {
      const notifyTarget = isPatient ? appointment.doctor : appointment.patient;
      const notifData = {
        recipient: notifyTarget,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Appointment for ${appointment.date} at ${appointment.timeSlot} was cancelled.`,
        link: `/appointments`
      };
      try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: error.message });
  }
};
