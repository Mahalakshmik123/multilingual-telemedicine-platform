import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 10:30 AM"
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  patientLanguage: string;
  doctorLanguage: string;
  needsInterpreter: boolean;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending'
    },
    patientLanguage: { type: String, default: 'ta' },
    doctorLanguage: { type: String, default: 'en' },
    needsInterpreter: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

// Prevent double booking for the same doctor/time slot on same date unless cancelled/rejected
AppointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1, status: 1 });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
