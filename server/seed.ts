import bcrypt from 'bcryptjs';
import { User } from './models/User.ts';
import { Doctor } from './models/Doctor.ts';
import { Patient } from './models/Patient.ts';
import { Interpreter } from './models/Interpreter.ts';
import { MedicalTerm } from './models/MedicalTerm.ts';
import { Appointment } from './models/Appointment.ts';
import { Consultation } from './models/Consultation.ts';
import { Prescription } from './models/Prescription.ts';
import { InterpreterRequest } from './models/InterpreterRequest.ts';
import { Notification } from './models/Notification.ts';
import { memoryStore } from './models/store.ts';

export async function seedDatabase(force: boolean = false) {
  try {
    const existingUsers = await memoryStore.users.find();
    if (existingUsers.length > 0 && !force) {
      console.log('[Seed] Database already seeded. Skipping.');
      return;
    }

    console.log('[Seed] Seeding Multilingual Telemedicine Platform data...');

    // Clear memory store if forcing
    if (force) {
      await memoryStore.users.clear();
      await memoryStore.doctors.clear();
      await memoryStore.patients.clear();
      await memoryStore.interpreters.clear();
      await memoryStore.medicalTerms.clear();
      await memoryStore.appointments.clear();
      await memoryStore.consultations.clear();
      await memoryStore.prescriptions.clear();
      await memoryStore.notifications.clear();
      await memoryStore.interpreterRequests.clear();
    }

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const docPass = await bcrypt.hash('doctor123', salt);
    const patPass = await bcrypt.hash('patient123', salt);
    const intPass = await bcrypt.hash('interpreter123', salt);

    // 1. Admin
    const adminUser = await memoryStore.users.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: adminPass,
      role: 'admin',
      phone: '+91 98400 11223',
      preferredLanguage: 'en',
      status: 'active'
    });

    // 2. Doctor 1 (Dr. Rajesh Sharma)
    const docUser1 = await memoryStore.users.create({
      name: 'Dr. Rajesh Sharma',
      email: 'doctor@example.com',
      password: docPass,
      role: 'doctor',
      phone: '+91 98401 23456',
      preferredLanguage: 'en',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
    });

    const doc1 = await memoryStore.doctors.create({
      user: docUser1._id || docUser1.id,
      specialization: 'General Physician',
      qualification: 'MBBS, MD (Internal Medicine)',
      experience: 12,
      languagesSpoken: ['en', 'hi', 'ta'],
      licenseNumber: 'MCI-TN-45892',
      profileDescription: 'Experienced physician dedicated to compassionate, cross-cultural patient care with high diagnostic precision.',
      consultationFee: 500,
      rating: 4.9,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM', '02:00 PM - 02:30 PM', '04:00 PM - 04:30 PM'],
      isAvailableToday: true
    });

    // 3. Doctor 2 (Dr. Priya Nair - Pediatrician)
    const docUser2 = await memoryStore.users.create({
      name: 'Dr. Priya Nair',
      email: 'dr.priya@example.com',
      password: docPass,
      role: 'doctor',
      phone: '+91 98402 34567',
      preferredLanguage: 'en',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813587-42211516e16d?w=300&auto=format&fit=crop&q=80'
    });

    await memoryStore.doctors.create({
      user: docUser2._id || docUser2.id,
      specialization: 'Pediatrician',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experience: 8,
      languagesSpoken: ['en', 'ml', 'ta'],
      licenseNumber: 'MCI-KL-67210',
      profileDescription: 'Specialist in pediatric care, child development, and neonatal health with warm multilingual communication.',
      consultationFee: 600,
      rating: 4.95,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      availableTimeSlots: ['10:00 AM - 10:30 AM', '11:30 AM - 12:00 PM', '03:00 PM - 03:30 PM', '05:00 PM - 05:30 PM'],
      isAvailableToday: true
    });

    // 4. Doctor 3 (Dr. Arun Kumar - Cardiologist)
    const docUser3 = await memoryStore.users.create({
      name: 'Dr. Arun Kumar',
      email: 'dr.arun@example.com',
      password: docPass,
      role: 'doctor',
      phone: '+91 98403 45678',
      preferredLanguage: 'en',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80'
    });

    await memoryStore.doctors.create({
      user: docUser3._id || docUser3.id,
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: 15,
      languagesSpoken: ['en', 'ta', 'te'],
      licenseNumber: 'MCI-TN-98124',
      profileDescription: 'Cardiologist specializing in cardiovascular risk management, hypertension control, and lifestyle cardiology.',
      consultationFee: 800,
      rating: 4.88,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: ['09:30 AM - 10:00 AM', '11:00 AM - 11:30 AM', '04:00 PM - 04:30 PM'],
      isAvailableToday: true
    });

    // 5. Patient 1 (Kavitha Murugan - Tamil Speaker)
    const patUser1 = await memoryStore.users.create({
      name: 'Kavitha Murugan',
      email: 'patient@example.com',
      password: patPass,
      role: 'patient',
      phone: '+91 98404 56789',
      preferredLanguage: 'ta',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
    });

    await memoryStore.patients.create({
      user: patUser1._id || patUser1.id,
      age: 34,
      gender: 'female',
      preferredLanguage: 'ta',
      medicalHistory: ['Mild seasonal allergies', 'Hypertension (monitored)'],
      allergies: ['Penicillin'],
      emergencyContact: {
        name: 'Murugan Sundaram',
        relationship: 'Spouse',
        phone: '+91 98404 99999'
      }
    });

    // 6. Patient 2 (Rahul Verma - Hindi Speaker)
    const patUser2 = await memoryStore.users.create({
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      password: patPass,
      role: 'patient',
      phone: '+91 98405 67890',
      preferredLanguage: 'hi',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
    });

    await memoryStore.patients.create({
      user: patUser2._id || patUser2.id,
      age: 42,
      gender: 'male',
      preferredLanguage: 'hi',
      medicalHistory: ['Type 2 Diabetes'],
      allergies: ['None known'],
      emergencyContact: {
        name: 'Pooja Verma',
        relationship: 'Spouse',
        phone: '+91 98405 88888'
      }
    });

    // 7. Interpreter (Ananya Raman - Certified Medical Interpreter)
    const intUser = await memoryStore.users.create({
      name: 'Ananya Raman',
      email: 'interpreter@example.com',
      password: intPass,
      role: 'interpreter',
      phone: '+91 98406 78901',
      preferredLanguage: 'ta',
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
    });

    await memoryStore.interpreters.create({
      user: intUser._id || intUser.id,
      languages: ['ta', 'en', 'hi', 'te'],
      availabilityStatus: 'available',
      qualification: 'Certified Healthcare Interpreter (CHI) & CMI',
      certifications: ['NBCMI Board Certified', 'ATA Member - Medical Division'],
      rating: 4.95,
      totalSessionsCompleted: 142
    });

    // 8. Seed Medical Terminology
    const medicalTermsData = [
      {
        term: 'Fever',
        category: 'General Medicine',
        translations: {
          english: 'Fever',
          tamil: 'காய்ச்சல்',
          hindi: 'बुखार',
          telugu: 'జ్వరం',
          malayalam: 'പനി',
          kannada: 'ಜ್ವರ'
        },
        definition: 'An abnormal elevation of body temperature above 37°C (98.6°F) in response to infection or inflammation.',
        simplifiedExplanation: 'When the body gets hot to fight off illness or germs.'
      },
      {
        term: 'Headache',
        category: 'Neurology',
        translations: {
          english: 'Headache',
          tamil: 'தலைவலி',
          hindi: 'सिरदर्द',
          telugu: 'తలనొప్పి',
          malayalam: 'തലവേദന',
          kannada: 'ತಲೆನೋವು'
        },
        definition: 'Pain arising from any part of the head, including the scalp, blood vessels, or surrounding nerves.',
        simplifiedExplanation: 'Pain or throbbing in the head.'
      },
      {
        term: 'Hypertension',
        category: 'Cardiology',
        translations: {
          english: 'High Blood Pressure',
          tamil: 'உயர் இரத்த அழுத்தம்',
          hindi: 'उच्च रक्तचाप',
          telugu: 'అధిక రక్తపోటు',
          malayalam: 'ഉയർന്ന രക്തസമ്മർദ്ദം',
          kannada: 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ'
        },
        definition: 'Persistent elevation of systemic arterial blood pressure above 130/80 mmHg.',
        simplifiedExplanation: 'Blood pushing too hard through the pipes of your body.'
      },
      {
        term: 'Diabetes',
        category: 'Endocrinology',
        translations: {
          english: 'Diabetes / High Sugar',
          tamil: 'நீரிழிவு நோய் / சர்க்கரை நோய்',
          hindi: 'मधुमेह / शुगर की बीमारी',
          telugu: 'మధుమేహం / చక్కర వ్యాధి',
          malayalam: 'പ്രമേഹം',
          kannada: 'ಮಧುಮೇಹ'
        },
        definition: 'A metabolic disorder characterized by elevated levels of glucose in the blood due to insulin deficiency or resistance.',
        simplifiedExplanation: 'A condition where the body cannot properly balance sugar in the bloodstream.'
      },
      {
        term: 'Chest Pain',
        category: 'Cardiology',
        translations: {
          english: 'Chest Pain',
          tamil: 'மார்பு வலி / நெஞ்சு வலி',
          hindi: 'सीने में दर्द',
          telugu: 'ఛాతీ నొప్పి / గుండె నొప్పి',
          malayalam: 'നെഞ്ചുവേദന',
          kannada: 'ಎದೆ ನೋವು'
        },
        definition: 'Discomfort, pressure, or aching felt in the chest area, potentially related to cardiac, muscular, or digestive causes.',
        simplifiedExplanation: 'Discomfort or pain inside the chest. Urgent evaluation is vital.'
      },
      {
        term: 'Cough',
        category: 'Pulmonology',
        translations: {
          english: 'Cough',
          tamil: 'இருமல்',
          hindi: 'खांसी',
          telugu: 'దగ్గు',
          malayalam: 'ചുമ',
          kannada: 'ಕೆಮ್ಮು'
        },
        definition: 'A protective reflex clearing respiratory passages of secretions, foreign particles, or irritants.',
        simplifiedExplanation: 'The throat coughing out phlegm or irritation.'
      },
      {
        term: 'Cold',
        category: 'General Medicine',
        translations: {
          english: 'Common Cold / Runny Nose',
          tamil: 'சளி',
          hindi: 'सर्दी / जुकाम',
          telugu: 'జలుబు',
          malayalam: 'ജലദോഷം',
          kannada: 'ನೆಗಡಿ'
        },
        definition: 'A viral infectious disease of the upper respiratory tract primarily affecting the nose and throat.',
        simplifiedExplanation: 'Sneezing, stuffy or runny nose from a mild viral bug.'
      },
      {
        term: 'Stomach Pain',
        category: 'Gastroenterology',
        translations: {
          english: 'Stomach Pain / Abdominal Cramps',
          tamil: 'வயிற்று வலி',
          hindi: 'पेट दर्द',
          telugu: 'కడుపు నొప్పి',
          malayalam: 'വയറുവേദന',
          kannada: 'ಹೊಟ್ಟೆ ನೋವು'
        },
        definition: 'Discomfort anywhere between the chest and groin, commonly stemming from gastritis, indigestion, or infection.',
        simplifiedExplanation: 'Pain or cramping felt in the tummy area.'
      },
      {
        term: 'Dizziness',
        category: 'Neurology',
        translations: {
          english: 'Dizziness / Vertigo',
          tamil: 'மயக்கம் / தலைச்சுற்றல்',
          hindi: 'चक्कर आना',
          telugu: 'తలతిరగడం',
          malayalam: 'തലകറക്കം',
          kannada: 'ತಲೆಸುತ್ತು'
        },
        definition: 'Sensory disturbance involving unsteadiness, feeling faint, or spinning sensations.',
        simplifiedExplanation: 'Feeling faint, lightheaded, or like the room is spinning.'
      },
      {
        term: 'Vomiting',
        category: 'Gastroenterology',
        translations: {
          english: 'Vomiting / Nausea',
          tamil: 'வாந்தி',
          hindi: 'उल्टी आना',
          telugu: 'వాంతులు',
          malayalam: 'ഛർദ്ദി',
          kannada: 'ವಾಂತಿ'
        },
        definition: 'Involuntary ejection of stomach contents through the mouth.',
        simplifiedExplanation: 'Throwing up food or fluids from the stomach.'
      },
      {
        term: 'Allergy',
        category: 'Immunology',
        translations: {
          english: 'Allergy / Hypersensitivity',
          tamil: 'ஒவ்வாமை',
          hindi: 'एलर्जी',
          telugu: 'అలర్జీ',
          malayalam: 'അലർജി',
          kannada: 'ಅಲರ್ಜಿ'
        },
        definition: 'A damaging immune response by the body to a substance to which it has become hypersensitive.',
        simplifiedExplanation: 'The body overreacting to pollen, food, or medicines.'
      },
      {
        term: 'Dosage',
        category: 'Pharmacology',
        translations: {
          english: 'Dosage',
          tamil: 'மருந்தளவு',
          hindi: 'खुराक / मात्रा',
          telugu: 'మోతాదు',
          malayalam: 'മരുന്നിന്റെ അളവ്',
          kannada: 'ಔಷಧದ ಪ್ರಮಾಣ'
        },
        definition: 'The specified quantity and frequency of a therapeutic agent to be administered.',
        simplifiedExplanation: 'The exact amount of medicine you should take each time.'
      },
      {
        term: 'Prescription',
        category: 'Pharmacology',
        translations: {
          english: 'Prescription',
          tamil: 'மருந்துச் சீட்டு',
          hindi: 'दवा का पर्चा',
          telugu: 'వైద్య చిట్టీ',
          malayalam: 'കുറിപ്പടി',
          kannada: 'ಔಷಧ ಚೀಟಿ'
        },
        definition: 'A physician’s written direction for the preparation and administration of a remedy.',
        simplifiedExplanation: 'The official doctor paper with instructions for the medical pharmacy.'
      }
    ];

    for (const term of medicalTermsData) {
      await memoryStore.medicalTerms.create(term);
    }

    // 9. Seed Appointments
    const appt1 = await memoryStore.appointments.create({
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      date: '2026-10-05',
      timeSlot: '10:00 AM - 10:30 AM',
      reason: 'Fever and severe headache for 3 days (மூன்று நாட்களாக காய்ச்சல் மற்றும் தலைவலி)',
      status: 'confirmed',
      patientLanguage: 'ta',
      doctorLanguage: 'en',
      needsInterpreter: true,
      notes: 'Patient feels comfortable communicating primarily in Tamil.'
    });

    const appt2 = await memoryStore.appointments.create({
      patient: patUser2._id || patUser2.id,
      doctor: docUser1._id || docUser1.id,
      date: '2026-10-06',
      timeSlot: '02:00 PM - 02:30 PM',
      reason: 'Routine blood sugar checkup and dietary advice (नियमित शुगर जांच)',
      status: 'pending',
      patientLanguage: 'hi',
      doctorLanguage: 'en',
      needsInterpreter: false
    });

    // 10. Completed Consultation with Prescription & Summary
    const pastAppt = await memoryStore.appointments.create({
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      date: '2026-09-28',
      timeSlot: '11:00 AM - 11:30 AM',
      reason: 'Mild throat pain and seasonal cold (தொண்டை வலி மற்றும் சளி)',
      status: 'completed',
      patientLanguage: 'ta',
      doctorLanguage: 'en',
      needsInterpreter: true
    });

    const consult = await memoryStore.consultations.create({
      appointment: pastAppt._id || pastAppt.id,
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      interpreter: intUser._id || intUser.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 4 * 86400000),
      endedAt: new Date(Date.now() - 4 * 86400000 + 1800000),
      symptoms: 'Throat discomfort, mild fever, sneezing',
      durationOfSymptoms: '2 days',
      doctorObservations: 'Pharyngeal erythema observed, clear lung fields, no cervical lymphadenopathy.',
      diagnosis: 'Acute Viral Pharyngitis & Upper Respiratory Tract Infection',
      treatmentPlan: 'Hydration, warm salt water gargle, Paracetamol 500mg as needed, Cetirizine 10mg at bedtime for 3 days.',
      followUpInstructions: 'Review in 3 days if fever exceeds 101F or difficulty swallowing develops.',
      aiSummary: {
        symptomsSummary: 'Patient presented with throat irritation, mild body temperature, and nasal sneezing.',
        duration: '2 days duration.',
        observations: 'Clinical throat redness without purulent exudates.',
        diagnosis: 'Acute Viral Pharyngitis (Doctor Confirmed)',
        treatmentPlan: 'Symptomatic relief with antipyretic, antihistamine, and warm oral hydration.',
        followUp: 'Return if persistent high fever or respiratory difficulty.',
        keyMedicalTerms: ['Pharyngitis', 'Antihistamine', 'Analgesic'],
        generatedAt: new Date(),
        disclaimer: 'DISCLAIMER: Summary generated by AI documentation assistant. The doctor remains solely responsible for clinical diagnoses and treatment decisions.'
      },
      emergencyAlertTriggered: false
    });

    // Past Prescription
    await memoryStore.prescriptions.create({
      consultation: consult._id || consult.id,
      appointment: pastAppt._id || pastAppt.id,
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      medicines: [
        {
          name: 'Paracetamol',
          dosage: '500 mg',
          frequency: 'Twice daily after meals',
          duration: '3 days',
          instructions: 'Take when fever or throat discomfort is elevated.'
        },
        {
          name: 'Cetirizine',
          dosage: '10 mg',
          frequency: 'Once daily at bedtime',
          duration: '3 days',
          instructions: 'May cause mild drowsiness.'
        }
      ],
      diagnosis: 'Acute Viral Pharyngitis',
      generalAdvice: 'Drink lukewarm water and gargle with warm salt water thrice daily.',
      dietaryRestrictions: 'Avoid ice-cold beverages and oily foods.',
      translatedInstructions: {
        language: 'ta',
        text: 'பாராசிட்டமால் 500mg உணவுக்குப் பிறகு தினமும் இரண்டு முறை உட்கொள்ளவும். இரவில் செடிரிசின் 10mg எடுத்துக் கொள்ளவும்.'
      }
    });

    // Active Consultation for Upcoming Live Demo
    await memoryStore.consultations.create({
      appointment: appt1._id || appt1.id,
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      status: 'scheduled',
      symptoms: 'Fever and severe headache for 3 days (மூன்று நாட்களாக காய்ச்சல் மற்றும் தலைவலி)',
      emergencyAlertTriggered: false
    });

    // Seed Messages in Consultation
    await memoryStore.messages.create({
      consultation: consult._id || consult.id,
      sender: patUser1._id || patUser1.id,
      senderName: 'Kavitha Murugan',
      senderRole: 'patient',
      originalText: 'எனக்கு இரண்டு நாட்களாக தொண்டை வலி இருக்கிறது.',
      originalLanguage: 'ta',
      translatedText: 'I have had a sore throat for two days.',
      targetLanguage: 'en',
      isEmergency: false,
      createdAt: new Date(Date.now() - 4 * 86400000 + 300000)
    });

    await memoryStore.messages.create({
      consultation: consult._id || consult.id,
      sender: docUser1._id || docUser1.id,
      senderName: 'Dr. Rajesh Sharma',
      senderRole: 'doctor',
      originalText: 'Do you also have a cough or high body temperature?',
      originalLanguage: 'en',
      translatedText: 'உங்களுக்கு இருமல் அல்லது அதிக உடல் சூடு இருக்கிறதா?',
      targetLanguage: 'ta',
      isEmergency: false,
      createdAt: new Date(Date.now() - 4 * 86400000 + 400000)
    });

    // Seed Interpreter Request
    await memoryStore.interpreterRequests.create({
      appointment: appt1._id || appt1.id,
      patient: patUser1._id || patUser1.id,
      doctor: docUser1._id || docUser1.id,
      patientLanguage: 'ta',
      doctorLanguage: 'en',
      status: 'pending',
      reason: 'Patient communicates primarily in Tamil; requires Tamil-English medical interpretation for upcoming consultation.',
      requestedAt: new Date()
    });

    // Seed Notifications
    await memoryStore.notifications.create({
      recipient: patUser1._id || patUser1.id,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Rajesh Sharma on 2026-10-05 at 10:00 AM - 10:30 AM is confirmed.',
      link: '/consultations'
    });

    await memoryStore.notifications.create({
      recipient: docUser1._id || docUser1.id,
      type: 'appointment_booked',
      title: 'New Consultation Scheduled',
      message: 'Kavitha Murugan booked an appointment for 2026-10-05. Interpreter assistance requested.',
      link: '/appointments'
    });

    await memoryStore.notifications.create({
      recipient: intUser._id || intUser.id,
      type: 'interpreter_requested',
      title: 'Live Medical Interpreter Request',
      message: 'Patient requires Tamil (தமிழ்) ⟷ English (English) interpretation.',
      link: '/interpreter'
    });

    console.log('[Seed] Data seeded successfully!');
  } catch (err: any) {
    console.error('[Seed Error]', err);
  }
}
