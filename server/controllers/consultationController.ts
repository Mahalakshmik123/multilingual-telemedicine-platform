import { Response } from 'express';
import { Consultation } from '../models/Consultation.ts';
import { Appointment } from '../models/Appointment.ts';
import { Message } from '../models/Message.ts';
import { User } from '../models/User.ts';
import { Prescription } from '../models/Prescription.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { translateMedicalText, generateConsultationSummary } from '../services/aiService.ts';
import { checkEmergencySymptoms } from '../services/emergencyService.ts';

export const getConsultationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let consultation: any = null;
    try {
      consultation = await Consultation.findById(id)
        .populate('patient', 'name email preferredLanguage avatarUrl')
        .populate('doctor', 'name email avatarUrl')
        .populate('interpreter', 'name email languages')
        .populate('appointment');
    } catch {}

    if (!consultation) {
      consultation = await memoryStore.consultations.findById(id);
      if (!consultation) {
        // Search by appointment ID
        consultation = await memoryStore.consultations.findOne({ appointment: id });
      }
      if (consultation) {
        const patient = await memoryStore.users.findById(String(consultation.patient));
        const doctor = await memoryStore.users.findById(String(consultation.doctor));
        const appointment = await memoryStore.appointments.findById(String(consultation.appointment));
        const interpreter = consultation.interpreter ? await memoryStore.users.findById(String(consultation.interpreter)) : null;

        consultation = {
          ...consultation,
          patient,
          doctor,
          appointment,
          interpreter
        };
      }
    }

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    // Role check: Only authorized patient, doctor, interpreter, or admin can access
    const userId = req.user?.id;
    const isPatient = String(consultation.patient?._id || consultation.patient?.id || consultation.patient) === String(userId);
    const isDoctor = String(consultation.doctor?._id || consultation.doctor?.id || consultation.doctor) === String(userId);
    const isInterpreter = consultation.interpreter && String(consultation.interpreter?._id || consultation.interpreter?.id || consultation.interpreter) === String(userId);
    const isAdmin = req.user?.role === 'admin';

    if (!isPatient && !isDoctor && !isInterpreter && !isAdmin) {
      res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view this medical consultation record.' });
      return;
    }

    // Get messages
    let messages: any[] = [];
    try {
      messages = await Message.find({ consultation: consultation._id || consultation.id }).sort({ createdAt: 1 });
    } catch {}
    if (!messages || messages.length === 0) {
      messages = await memoryStore.messages.find({ consultation: consultation._id || consultation.id });
    }

    // Get prescription if any
    let prescription: any = null;
    try {
      prescription = await Prescription.findOne({ consultation: consultation._id || consultation.id });
    } catch {}
    if (!prescription) {
      prescription = await memoryStore.prescriptions.findOne({ consultation: consultation._id || consultation.id });
    }

    res.json({
      success: true,
      consultation: {
        id: consultation._id || consultation.id,
        status: consultation.status,
        startedAt: consultation.startedAt,
        endedAt: consultation.endedAt,
        symptoms: consultation.symptoms,
        durationOfSymptoms: consultation.durationOfSymptoms,
        doctorObservations: consultation.doctorObservations,
        diagnosis: consultation.diagnosis,
        treatmentPlan: consultation.treatmentPlan,
        followUpInstructions: consultation.followUpInstructions,
        aiSummary: consultation.aiSummary,
        emergencyAlertTriggered: consultation.emergencyAlertTriggered,
        emergencyPhrasesDetected: consultation.emergencyPhrasesDetected,
        patient: consultation.patient,
        doctor: consultation.doctor,
        interpreter: consultation.interpreter,
        appointment: consultation.appointment,
        messages,
        prescription
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch consultation', error: error.message });
  }
};

export const startConsultation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let consultation: any = null;
    try {
      consultation = await Consultation.findById(id);
    } catch {}
    if (!consultation) {
      consultation = await memoryStore.consultations.findById(id);
    }

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    const updated = {
      status: 'in_progress',
      startedAt: consultation.startedAt || new Date()
    };

    try {
      await Consultation.findByIdAndUpdate(id, { $set: updated });
    } catch {}
    await memoryStore.consultations.findByIdAndUpdate(id, updated);

    res.json({ success: true, message: 'Consultation started', consultation: { ...consultation, ...updated } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to start consultation', error: error.message });
  }
};

export const postMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, sourceLanguage = 'en', targetLanguage = 'ta', audioBase64 } = req.body;

    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Message text cannot be empty' });
      return;
    }

    let consultation: any = null;
    try { consultation = await Consultation.findById(id); } catch {}
    if (!consultation) consultation = await memoryStore.consultations.findById(id);

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    // Real-time emergency symptom detection
    const emergencyCheck = checkEmergencySymptoms(text);

    // AI Translation
    const translationResult = await translateMedicalText(
      text,
      sourceLanguage,
      targetLanguage,
      consultation.symptoms || 'General Medicine'
    );

    const messageData = {
      consultation: consultation._id || consultation.id,
      sender: req.user?.id,
      senderName: req.user?.name || 'User',
      senderRole: req.user?.role || 'patient',
      originalText: text,
      originalLanguage: sourceLanguage,
      translatedText: translationResult.translatedText,
      targetLanguage,
      isEmergency: emergencyCheck.isEmergency,
      emergencyAlertText: emergencyCheck.alertMessage,
      audioBase64: audioBase64 || null
    };

    let savedMessage: any = null;
    try {
      savedMessage = await Message.create(messageData);
    } catch {
      savedMessage = await memoryStore.messages.create(messageData);
    }

    // If emergency symptom triggered, record it on consultation
    if (emergencyCheck.isEmergency) {
      const emergencyUpdate = {
        emergencyAlertTriggered: true,
        $addToSet: { emergencyPhrasesDetected: { $each: emergencyCheck.matchedPhrases } }
      };
      try {
        await Consultation.findByIdAndUpdate(consultation._id || consultation.id, emergencyUpdate);
      } catch {
        const phrases = consultation.emergencyPhrasesDetected || [];
        emergencyCheck.matchedPhrases.forEach(p => { if (!phrases.includes(p)) phrases.push(p); });
        await memoryStore.consultations.findByIdAndUpdate(consultation._id || consultation.id, {
          emergencyAlertTriggered: true,
          emergencyPhrasesDetected: phrases
        });
      }
    }

    res.status(201).json({
      success: true,
      message: savedMessage,
      emergencyAlert: emergencyCheck.isEmergency
        ? {
            alertMessage: emergencyCheck.alertMessage,
            matchedPhrases: emergencyCheck.matchedPhrases,
            disclaimer: emergencyCheck.disclaimer
          }
        : null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to post message', error: error.message });
  }
};

export const endConsultationAndSummarize = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { doctorDiagnosis, doctorObservations, treatmentPlan, followUpInstructions, durationOfSymptoms } = req.body;

    if (!req.user || req.user.role !== 'doctor') {
      res.status(403).json({ success: false, message: 'Only attending doctor can finalize diagnosis and summarize consultation' });
      return;
    }

    let consultation: any = null;
    try {
      consultation = await Consultation.findById(id).populate('patient', 'name').populate('doctor', 'name');
    } catch {}
    if (!consultation) {
      consultation = await memoryStore.consultations.findById(id);
      if (consultation) {
        consultation.patient = await memoryStore.users.findById(String(consultation.patient));
        consultation.doctor = await memoryStore.users.findById(String(consultation.doctor));
      }
    }

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found' });
      return;
    }

    // Fetch messages for context
    let messages: any[] = [];
    try {
      messages = await Message.find({ consultation: id }).limit(20);
    } catch {}
    if (!messages.length) {
      messages = await memoryStore.messages.find({ consultation: id });
    }

    const conversationSnippet = messages
      .slice(-10)
      .map(m => `${m.senderName}: ${m.originalText} (Trans: ${m.translatedText})`)
      .join('\n');

    // Generate structured AI summary (the AI does NOT diagnose independently)
    const summary = await generateConsultationSummary({
      patientName: consultation.patient?.name || 'Patient',
      doctorName: consultation.doctor?.name || 'Doctor',
      symptoms: consultation.symptoms,
      duration: durationOfSymptoms || consultation.durationOfSymptoms,
      doctorObservations: doctorObservations || consultation.doctorObservations,
      doctorDiagnosis: doctorDiagnosis || 'Clinical consultation evaluation',
      treatmentPlan: treatmentPlan || consultation.treatmentPlan,
      followUpInstructions: followUpInstructions || consultation.followUpInstructions,
      conversationSnippet
    });

    const updatePayload = {
      status: 'completed',
      endedAt: new Date(),
      doctorObservations: doctorObservations || consultation.doctorObservations,
      diagnosis: doctorDiagnosis || consultation.diagnosis,
      treatmentPlan: treatmentPlan || consultation.treatmentPlan,
      followUpInstructions: followUpInstructions || consultation.followUpInstructions,
      durationOfSymptoms: durationOfSymptoms || consultation.durationOfSymptoms,
      aiSummary: {
        ...summary,
        generatedAt: new Date()
      }
    };

    try {
      await Consultation.findByIdAndUpdate(id, { $set: updatePayload });
    } catch {}
    await memoryStore.consultations.findByIdAndUpdate(id, updatePayload);

    // Also update associated appointment status to completed
    if (consultation.appointment) {
      const apptId = consultation.appointment._id || consultation.appointment.id || consultation.appointment;
      try { await Appointment.findByIdAndUpdate(apptId, { status: 'completed' }); } catch {}
      await memoryStore.appointments.findByIdAndUpdate(String(apptId), { status: 'completed' });
    }

    res.json({
      success: true,
      message: 'Consultation completed and AI summary generated successfully',
      summary: updatePayload.aiSummary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to complete consultation', error: error.message });
  }
};

export const getConsultationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const filter: any = { status: 'completed' };
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } else if (req.user.role === 'interpreter') {
      filter.interpreter = req.user.id;
    }

    let history: any[] = [];
    try {
      history = await Consultation.find(filter)
        .populate('patient', 'name email preferredLanguage avatarUrl')
        .populate('doctor', 'name email avatarUrl')
        .populate('appointment')
        .sort({ endedAt: -1, createdAt: -1 });
    } catch {}

    if (!history || history.length === 0) {
      const all = await memoryStore.consultations.find(filter);
      history = await Promise.all(
        all.map(async c => {
          const patient = await memoryStore.users.findById(String(c.patient));
          const doctor = await memoryStore.users.findById(String(c.doctor));
          const appointment = await memoryStore.appointments.findById(String(c.appointment));
          return {
            ...c,
            patient,
            doctor,
            appointment
          };
        })
      );
    }

    res.json({
      success: true,
      count: history.length,
      history: history.map(h => ({
        id: h._id || h.id,
        status: h.status,
        startedAt: h.startedAt,
        endedAt: h.endedAt,
        symptoms: h.symptoms,
        diagnosis: h.diagnosis,
        treatmentPlan: h.treatmentPlan,
        followUpInstructions: h.followUpInstructions,
        aiSummary: h.aiSummary,
        emergencyAlertTriggered: h.emergencyAlertTriggered,
        patient: h.patient
          ? {
              id: h.patient._id || h.patient.id,
              name: h.patient.name,
              preferredLanguage: h.patient.preferredLanguage
            }
          : null,
        doctor: h.doctor
          ? {
              id: h.doctor._id || h.doctor.id,
              name: h.doctor.name
            }
          : null,
        appointment: h.appointment
          ? {
              date: h.appointment.date,
              timeSlot: h.appointment.timeSlot
            }
          : null
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch consultation history', error: error.message });
  }
};
