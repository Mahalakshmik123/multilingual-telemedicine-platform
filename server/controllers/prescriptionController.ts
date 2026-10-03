import { Response } from 'express';
import { Prescription } from '../models/Prescription.ts';
import { Consultation } from '../models/Consultation.ts';
import { User } from '../models/User.ts';
import { Notification } from '../models/Notification.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { translateMedicalText } from '../services/aiService.ts';

export const createPrescription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only licensed doctors can issue prescriptions' });
      return;
    }

    const { consultationId, patientId, medicines, diagnosis, generalAdvice, dietaryRestrictions } = req.body;

    if (!consultationId || !patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      res.status(400).json({ success: false, message: 'Prescription requires consultation ID, patient ID and at least one medicine item' });
      return;
    }

    // Fetch patient language for translation assistance
    let patient: any = null;
    try { patient = await User.findById(patientId); } catch {}
    if (!patient) patient = await memoryStore.users.findById(patientId);

    const targetLang = patient?.preferredLanguage || 'ta';

    // Compile instructions text
    const instructionsCombined = medicines.map(m => `${m.name}: ${m.dosage}, ${m.frequency} for ${m.duration}. ${m.instructions || ''}`).join('\n');

    let translatedInstructions = null;
    if (targetLang && targetLang !== 'en') {
      const trans = await translateMedicalText(instructionsCombined, 'en', targetLang, 'Prescription Dosage Instructions');
      translatedInstructions = {
        language: targetLang,
        text: trans.translatedText
      };
    }

    const prescriptionData = {
      consultation: consultationId,
      patient: patientId,
      doctor: req.user.id,
      medicines,
      diagnosis: diagnosis || 'General Medical Consultation',
      generalAdvice: generalAdvice || 'Take plenty of fluids and get adequate rest.',
      dietaryRestrictions: dietaryRestrictions || 'Avoid spicy and deep-fried food during medication course.',
      translatedInstructions
    };

    let prescription: any = null;
    try {
      prescription = await Prescription.create(prescriptionData);
    } catch {
      prescription = await memoryStore.prescriptions.create(prescriptionData);
    }

    // Notify patient
    const notifData = {
      recipient: patientId,
      type: 'prescription_ready',
      title: 'New Prescription Issued',
      message: `Dr. ${req.user.name} has issued an electronic medical prescription for your consultation.`,
      link: `/prescriptions`
    };
    try { await Notification.create(notifData); } catch { await memoryStore.notifications.create(notifData); }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create prescription', error: error.message });
  }
};

export const getPrescriptions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const filter: any = {};
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    }

    let prescriptions: any[] = [];
    try {
      prescriptions = await Prescription.find(filter)
        .populate('patient', 'name email preferredLanguage')
        .populate('doctor', 'name email')
        .sort({ createdAt: -1 });
    } catch {}

    if (!prescriptions || prescriptions.length === 0) {
      const all = await memoryStore.prescriptions.find(filter);
      prescriptions = await Promise.all(
        all.map(async p => {
          const patient = await memoryStore.users.findById(String(p.patient));
          const doctor = await memoryStore.users.findById(String(p.doctor));
          return {
            ...p,
            patient,
            doctor
          };
        })
      );
    }

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions: prescriptions.map(p => ({
        id: p._id || p.id,
        consultationId: p.consultation,
        medicines: p.medicines,
        diagnosis: p.diagnosis,
        generalAdvice: p.generalAdvice,
        dietaryRestrictions: p.dietaryRestrictions,
        translatedInstructions: p.translatedInstructions,
        createdAt: p.createdAt,
        patient: p.patient
          ? {
              id: p.patient._id || p.patient.id,
              name: p.patient.name,
              email: p.patient.email,
              preferredLanguage: p.patient.preferredLanguage
            }
          : null,
        doctor: p.doctor
          ? {
              id: p.doctor._id || p.doctor.id,
              name: p.doctor.name,
              email: p.doctor.email
            }
          : null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions', error: error.message });
  }
};

export const getPrescriptionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let p: any = null;
    try {
      p = await Prescription.findById(id)
        .populate('patient', 'name email preferredLanguage')
        .populate('doctor', 'name email');
    } catch {}

    if (!p) {
      p = await memoryStore.prescriptions.findById(id);
      if (p) {
        p.patient = await memoryStore.users.findById(String(p.patient));
        p.doctor = await memoryStore.users.findById(String(p.doctor));
      }
    }

    if (!p) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }

    // Role check
    const userId = req.user?.id;
    const isPatient = String(p.patient?._id || p.patient?.id || p.patient) === String(userId);
    const isDoctor = String(p.doctor?._id || p.doctor?.id || p.doctor) === String(userId);
    const isAdmin = req.user?.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this prescription' });
      return;
    }

    res.json({ success: true, prescription: p });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch prescription', error: error.message });
  }
};
