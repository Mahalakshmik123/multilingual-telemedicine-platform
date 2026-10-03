import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  user: mongoose.Types.ObjectId;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  preferredLanguage: string;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const PatientSchema = new Schema<IPatient>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number, default: 30 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    preferredLanguage: { type: String, default: 'ta' },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
