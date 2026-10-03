import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  interpreter?: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: Date;
  endedAt?: Date;
  symptoms: string;
  durationOfSymptoms?: string;
  doctorObservations?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
  aiSummary?: {
    symptomsSummary: string;
    duration: string;
    observations: string;
    diagnosis: string;
    treatmentPlan: string;
    followUp: string;
    keyMedicalTerms: string[];
    generatedAt: Date;
    disclaimer: string;
  };
  emergencyAlertTriggered: boolean;
  emergencyPhrasesDetected?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interpreter: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    symptoms: { type: String, default: '' },
    durationOfSymptoms: { type: String, default: '' },
    doctorObservations: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    treatmentPlan: { type: String, default: '' },
    followUpInstructions: { type: String, default: '' },
    aiSummary: {
      symptomsSummary: { type: String },
      duration: { type: String },
      observations: { type: String },
      diagnosis: { type: String },
      treatmentPlan: { type: String },
      followUp: { type: String },
      keyMedicalTerms: [{ type: String }],
      generatedAt: { type: Date },
      disclaimer: { type: String }
    },
    emergencyAlertTriggered: { type: Boolean, default: false },
    emergencyPhrasesDetected: [{ type: String }]
  },
  { timestamps: true }
);

export const Consultation = mongoose.models.Consultation || mongoose.model<IConsultation>('Consultation', ConsultationSchema);
