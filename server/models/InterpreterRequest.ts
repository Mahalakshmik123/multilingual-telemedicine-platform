import mongoose, { Schema, Document } from 'mongoose';

export interface IInterpreterRequest extends Document {
  appointment?: mongoose.Types.ObjectId;
  consultation?: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  interpreter?: mongoose.Types.ObjectId;
  patientLanguage: string;
  doctorLanguage: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  reason?: string;
  requestedAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

const InterpreterRequestSchema = new Schema<IInterpreterRequest>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    consultation: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interpreter: { type: Schema.Types.ObjectId, ref: 'User' },
    patientLanguage: { type: String, required: true },
    doctorLanguage: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
      index: true
    },
    reason: { type: String, default: 'Language interpretation required for medical consultation' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const InterpreterRequest = mongoose.models.InterpreterRequest || mongoose.model<IInterpreterRequest>('InterpreterRequest', InterpreterRequestSchema);
