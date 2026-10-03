# Multilingual Telemedicine Platform with Real-Time Medical Translation and Interpreter Assistance

A full-stack MERN web application engineered for college IT evaluation, bridging language barriers between non-English speaking patients and specialized healthcare practitioners.

---

## 1. Project Overview

In multilingual regions, language disparities frequently delay medical intervention, lead to misdiagnosis, and cause medication non-adherence. This platform provides:
* **Real-time bidirectional clinical translation** between Indian regional languages (Tamil, Hindi, Telugu, Malayalam, Kannada) and English.
* **Specialized Medical Terminology system** that preserves clinical accuracy (dosages, symptoms, anatomical descriptions).
* **Live Video Consultations** with simulated WebRTC / camera feeds and continuous live translated subtitles.
* **On-demand Human Interpreter Escalation** allowing doctors or patients to summon certified medical interpreters into active sessions.
* **Automated Emergency Symptom Detection** surfacing immediate safety alerts for acute symptoms (e.g. chest pain, difficulty breathing).
* **AI-Assisted Consultation Documentation** generating structured clinical summaries while maintaining the doctor's sole authority for diagnosis.
* **Electronic Prescriptions** with dosage directions automatically translated into the patient's primary language.

---

## 2. Technology Stack

### Frontend
* **React 19** with TypeScript
* **Vite** bundler
* **Tailwind CSS v4**
* **React Router DOM v7**
* **Axios** (with JWT bearer interceptors)
* **Socket.IO Client** (real-time signaling and chat)
* **Lucide React** (healthcare and interface iconography)
* **Web Speech API** (Speech-to-Text & Text-to-Speech audio synthesis)

### Backend
* **Node.js** & **Express.js**
* **Socket.IO** (WebSockets for bidirectional communication and signaling)
* **JWT (JSON Web Tokens)** for stateless role-based authentication
* **bcryptjs** for secure password hashing
* **MongoDB & Mongoose** (with automated embedded fallback store for zero-setup demo execution)

### AI & Language Processing
* **Google Gemini API (`@google/genai` TypeScript SDK)** using `gemini-3.8-flash` for clinical translation, medical terminology simplification, and consultation summarization.

---

## 3. Architecture & Core Workflow

```
Patient (e.g. Tamil)                Doctor (e.g. English)
       │                                     │
       ├── 1. Selects Language (தமிழ்)       │
       ├── 2. Searches & Books Specialist ───┤
       │                                     ├── 3. Doctor Accepts Booking
       ├── 4. Joins Video Consultation ──────┤
       │                                     │
       │   ◄─── 5. Real-Time Dialogue ───►   │
       │     (Speech-to-Text / Audio)        │
       │                 │                   │
       │                 ▼                   │
       │    [Emergency Symptom Check]        │
       │                 │                   │
       │                 ▼                   │
       │    [Medical Terminology Engine]     │
       │                 │                   │
       │                 ▼                   │
       │      [Gemini AI Translation]        │
       │                                     │
       ├── 6. [Escalate to Interpreter] ─────┼──► Certified Interpreter joins
       │                                     │
       │   ◄── 7. Electronic Prescription ───┤ (Auto-translated dosage)
       │                                     │
       └── 8. Receives Clinical Summary ─────┤ (Doctor validated)
```

---

## 4. Supported Languages

| Language | Native Name | Code | Speech Recognition Code | Sample Greeting |
|---|---|---|---|---|
| **English** | English | `en` | `en-US` | Hello, how can I help you today? |
| **Tamil** | தமிழ் | `ta` | `ta-IN` | வணக்கம், உங்களுக்கு நான் எவ்வாறு உதவ முடியும்? |
| **Hindi** | हिन्दी | `hi` | `hi-IN` | नमस्ते, आज मैं आपकी क्या मदद कर सकता हूँ? |
| **Telugu** | తెలుగు | `te` | `te-IN` | నమస్కారం, ఈ రోజు నేను మీకు ఎలా సహాయపడగలను? |
| **Malayalam** | മലയാളം | `ml` | `ml-IN` | നമസ്കാരം, ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം? |
| **Kannada** | ಕನ್ನಡ | `kn` | `kn-IN` | ನಮಸ್ಕಾರ, ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? |

---

## 5. Demo Accounts

A **1-Click Quick Demo Switcher** is present at the top banner of the application, or you can log in manually:

| Role | Email | Password | Details |
|---|---|---|---|
| **Patient** | `patient@example.com` | `patient123` | Kavitha Murugan (Primary Language: Tamil) |
| **Doctor** | `doctor@example.com` | `doctor123` | Dr. Rajesh Sharma (General Physician & Internal Medicine) |
| **Doctor 2** | `dr.priya@example.com` | `doctor123` | Dr. Priya Nair (Pediatrician) |
| **Doctor 3** | `dr.arun@example.com` | `doctor123` | Dr. Arun Kumar (Cardiologist) |
| **Interpreter** | `interpreter@example.com` | `interpreter123` | Ananya Raman (Certified Medical Interpreter - CMI) |
| **Admin** | `admin@example.com` | `admin123` | System Administrator |

---

## 6. Project Structure

```
├── server.ts                       # Express + Vite + Socket.IO server entry
├── server/
│   ├── config/
│   │   ├── db.ts                   # MongoDB connection + fallback memory engine
│   │   └── languages.ts            # Reusable language configuration
│   ├── controllers/
│   │   ├── authController.ts       # Register, login, profile, password change
│   │   ├── doctorController.ts     # Doctor search, filters, availability
│   │   ├── appointmentController.ts# Booking, double-booking prevention, status
│   │   ├── consultationController.ts# Video consultation, messages, AI summary
│   │   ├── translationController.ts# Medical translation & terminology explanation
│   │   ├── medicalTermController.ts# Medical terms CRUD & search
│   │   ├── prescriptionController.ts# e-Prescription creation & translation
│   │   ├── interpreterController.ts# Human interpreter escalation requests
│   │   ├── notificationController.ts# Real-time and persistent alerts
│   │   └── adminController.ts      # Platform metrics and user moderation
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification & role authorization
│   │   └── errorHandler.ts         # Centralized error handler
│   ├── models/
│   │   ├── User.ts                 # Base user credentials & role
│   │   ├── Patient.ts              # Patient medical history & language
│   │   ├── Doctor.ts               # Doctor qualifications, schedule & fee
│   │   ├── Interpreter.ts          # Interpreter certifications & languages
│   │   ├── Appointment.ts          # Scheduled bookings & double-booking index
│   │   ├── Consultation.ts         # Active session, diagnosis, symptoms, summary
│   │   ├── Message.ts              # Chat & speech transcripts with translations
│   │   ├── MedicalTerm.ts          # Medical vocabulary across 6 languages
│   │   ├── Prescription.ts         # Medicine items, dosages, instructions
│   │   ├── Notification.ts         # Real-time event notifications
│   │   ├── InterpreterRequest.ts   # Live escalation queue
│   │   └── store.ts                # In-memory document replica
│   ├── routes/                     # Modular Express REST API routes
│   ├── services/
│   │   ├── aiService.ts            # @google/genai Gemini API integration
│   │   └── emergencyService.ts     # Multilingual rule-based emergency detection
│   ├── sockets/
│   │   └── consultationSocket.ts   # WebRTC signaling, live chat & subtitles
│   └── seed.ts                     # Prepopulated demo data & dictionary
├── src/
│   ├── components/                 # Navbar, Footer, Cards, Modals, Banners
│   ├── context/
│   │   ├── AuthContext.tsx         # User authentication state
│   │   ├── LanguageContext.tsx     # Current language, TTS, STT helpers
│   │   └── SocketContext.tsx       # Live Socket.IO connection
│   ├── pages/                      # All responsive React pages
│   ├── services/
│   │   └── api.ts                  # Axios client with JWT interceptor
│   ├── utils/
│   │   └── languages.ts            # Language constants & localized strings
│   ├── App.tsx                     # Protected routes & layout
│   └── main.tsx                    # React DOM entry point
└── package.json
```

---

## 7. Environment Variables

Create or configure `.env` (or view `.env.example`):

```bash
# Gemini AI API Key for translation, summarization, and explanation
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# MongoDB Connection String (Optional: embedded in-memory database used if not provided)
MONGO_URI="mongodb://localhost:27017/telemedicine"

# JWT Secret
JWT_SECRET="medical_telemedicine_super_secure_jwt_secret_key_2026"

# Port
PORT=3000
```

---

## 8. Installation & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The unified Full-Stack application will start on **`http://localhost:3000`** with Express backend, Vite frontend, and Socket.IO mounted simultaneously.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 9. Key REST API Endpoints

### Authentication
* `POST /api/auth/register` - Create patient, doctor, or interpreter account
* `POST /api/auth/login` - Authenticate and receive JWT
* `GET /api/auth/profile` - Fetch current user profile & role details
* `PUT /api/auth/change-password` - Secure password update

### Doctors & Scheduling
* `GET /api/doctors` - Search doctors by name, specialization, language, availability
* `GET /api/doctors/:id` - Detailed doctor profile & qualifications
* `PUT /api/doctors/availability` - Update clinic online/offline hours

### Appointments
* `POST /api/appointments` - Book appointment (prevents double-booking)
* `GET /api/appointments` - List appointments filtered by role
* `PUT /api/appointments/:id` - Accept, reject, or cancel appointment

### Consultations & Live Translation
* `GET /api/consultations/:id` - Load session, messages, and prescriptions
* `POST /api/consultations/:id/messages` - Post text/speech with instant AI translation
* `PUT /api/consultations/:id/complete` - Finalize diagnosis and generate AI clinical summary
* `POST /api/translations` - Standalone medical text translation
* `POST /api/translations/explain` - Simplified layman explanation of medical jargon

### Interpreter Escalation
* `POST /api/interpreter-requests` - Request human interpreter for consultation
* `GET /api/interpreter-requests` - List live interpreter requests
* `PUT /api/interpreter-requests/:id` - Accept request and join session

### Prescriptions & History
* `POST /api/prescriptions` - Doctor creates e-prescription with auto-translated dosage
* `GET /api/prescriptions` - View prescriptions
* `GET /api/consultations/history` - Historical medical records

---

## 10. AI Safety & Clinical Compliance

1. **No Autonomous AI Diagnosis**: The AI never generates or replaces official medical diagnoses. The attending physician enters the official diagnosis and treatment plan; the AI formats and summarizes documented facts.
2. **Rule-Based Emergency Alert**: A high-priority rule-based detector flags terms such as *chest pain*, *difficulty breathing*, *severe bleeding*, or *unconscious* across all 6 languages, displaying an emergency notice directing the user to 108 / 112 / 911 emergency services.
3. **Clinical Terminology Preservation**: High-risk medical phrases (e.g. dosages, active ingredient names, durations) are preserved during translation to prevent medical errors.
